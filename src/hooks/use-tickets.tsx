import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getEvent, ticketFee } from "@/lib/live-data";

/** A pending ticket selection carried from an event page into checkout. */
export type TicketSelection = {
  eventId: string;
  quantities: Record<string, number>; // tierId -> qty
};

export type IssuedTicket = {
  code: string; // scannable code, also encoded in the QR
  tierId: string;
  tierName: string;
  seq: number; // 1-based within the order
};

export type TicketOrder = {
  id: string; // e.g. NXL-8F3K92
  eventId: string;
  purchasedAt: string; // ISO
  buyerName: string;
  buyerEmail: string;
  payMethod: "ecocash" | "card";
  items: { tierId: string; tierName: string; qty: number; unitPrice: number }[];
  subtotal: number;
  fees: number;
  total: number;
  tickets: IssuedTicket[];
};

type TicketsContextValue = {
  selection: TicketSelection | null;
  setSelection: (s: TicketSelection | null) => void;
  orders: TicketOrder[];
  placeOrder: (input: {
    buyerName: string;
    buyerEmail: string;
    payMethod: TicketOrder["payMethod"];
  }) => TicketOrder | null;
};

const TicketsContext = createContext<TicketsContextValue | undefined>(undefined);

const ORDERS_KEY = "nexuszim.live.orders.v1";
const SELECTION_KEY = "nexuszim.live.selection.v1";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars

function randomCode(groups: number, groupLen = 4): string {
  const parts: string[] = [];
  for (let g = 0; g < groups; g++) {
    let s = "";
    for (let i = 0; i < groupLen; i++) {
      s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    parts.push(s);
  }
  return parts.join("-");
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<TicketSelection | null>(null);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawOrders = localStorage.getItem(ORDERS_KEY);
      if (rawOrders) setOrders(JSON.parse(rawOrders));
      const rawSel = sessionStorage.getItem(SELECTION_KEY);
      if (rawSel) setSelectionState(JSON.parse(rawSel));
    } catch {
      // corrupted storage — start clean
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  function setSelection(s: TicketSelection | null) {
    setSelectionState(s);
    try {
      if (s) sessionStorage.setItem(SELECTION_KEY, JSON.stringify(s));
      else sessionStorage.removeItem(SELECTION_KEY);
    } catch {
      // storage unavailable — selection still works in-memory
    }
  }

  function placeOrder(input: {
    buyerName: string;
    buyerEmail: string;
    payMethod: TicketOrder["payMethod"];
  }): TicketOrder | null {
    if (!selection) return null;
    const event = getEvent(selection.eventId);
    if (!event) return null;

    const items = Object.entries(selection.quantities)
      .filter(([, qty]) => qty > 0)
      .map(([tierId, qty]) => {
        const tier = event.tiers.find((t) => t.id === tierId);
        return tier ? { tierId, tierName: tier.name, qty, unitPrice: tier.price } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (items.length === 0) return null;

    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const fees = items.reduce((s, it) => s + ticketFee(it.unitPrice) * it.qty, 0);
    const orderId = `NXL-${randomCode(1, 6)}`;

    const tickets: IssuedTicket[] = [];
    let seq = 0;
    for (const it of items) {
      for (let i = 0; i < it.qty; i++) {
        seq++;
        tickets.push({
          code: `NXL-${randomCode(3)}`,
          tierId: it.tierId,
          tierName: it.tierName,
          seq,
        });
      }
    }

    const order: TicketOrder = {
      id: orderId,
      eventId: event.id,
      purchasedAt: new Date().toISOString(),
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      payMethod: input.payMethod,
      items,
      subtotal,
      fees: Math.round(fees * 100) / 100,
      total: Math.round((subtotal + fees) * 100) / 100,
      tickets,
    };

    setOrders((xs) => [order, ...xs]);
    setSelection(null);
    return order;
  }

  return (
    <TicketsContext.Provider value={{ selection, setSelection, orders, placeOrder }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
