"use client";

import { Dispatch, SetStateAction } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  InvoiceData,
  LineItem,
  PaymentStatus,
  ServiceType,
} from "@/lib/invoice-types";

interface InvoiceFormProps {
  data: InvoiceData;
  setData: Dispatch<SetStateAction<InvoiceData>>;
  onDownload: () => void;
  onReset: () => void;
}

export default function InvoiceForm({
  data,
  setData,
  onDownload,
  onReset,
}: InvoiceFormProps) {
  const updateField = <K extends keyof InvoiceData>(
    key: K,
    value: InvoiceData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const addLineItem = () => {
    setData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: crypto.randomUUID(),
          description: "",
          qty: 1,
          rate: 0,
        },
      ],
    }));
  };

  const removeLineItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const subTotal = data.lineItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );
  const balance = subTotal - data.discount - data.paymentReceived;

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h2
          className="text-base font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "var(--font-heading, sans-serif)" }}
        >
          Invoice Details
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Fill in the fields — preview updates live
        </p>
      </div>

      {/* Client Info */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Client Info
        </h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="billTo">Bill To *</Label>
          <Input
            id="billTo"
            placeholder="Client full name"
            value={data.billTo}
            onChange={(e) => updateField("billTo", e.target.value)}
          />
        </div>
      </section>

      {/* Invoice Meta */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Invoice Meta
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              type="number"
              value={data.invoiceNumber}
              onChange={(e) =>
                updateField("invoiceNumber", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={data.invoiceDate}
              onChange={(e) => updateField("invoiceDate", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Services Type</Label>
          <Select
            value={data.serviceType}
            onValueChange={(v) => updateField("serviceType", v as ServiceType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LLC Formation">LLC Formation</SelectItem>
              <SelectItem value="ITIN">ITIN</SelectItem>
              <SelectItem value="Registered Agent">Registered Agent</SelectItem>
              <SelectItem value="NM LLC Formation + ITIN">NM LLC Formation + ITIN</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invoiceBy">Invoice By</Label>
          <Input
            id="invoiceBy"
            placeholder="Team member name"
            value={data.invoiceBy}
            onChange={(e) => updateField("invoiceBy", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Payment Status</Label>
          <Select
            value={data.paymentStatus}
            onValueChange={(v) =>
              updateField("paymentStatus", v as PaymentStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partial Paid">Partial Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Line Items */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Line Items
        </h3>
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_56px_80px_80px_32px] gap-1.5 text-xs font-medium text-muted-foreground px-0.5">
            <span>Description</span>
            <span className="text-center">QTY</span>
            <span className="text-center">Rate ($)</span>
            <span className="text-center">Amount</span>
            <span />
          </div>
          {data.lineItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_56px_80px_80px_32px] gap-1.5 items-center"
            >
              <Input
                placeholder="Service description"
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, "description", e.target.value)
                }
                className="text-sm"
              />
              <Input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) =>
                  updateLineItem(item.id, "qty", parseFloat(e.target.value) || 0)
                }
                className="text-sm text-center px-1"
              />
              <Input
                type="number"
                min={0}
                step={0.01}
                value={item.rate}
                onChange={(e) =>
                  updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)
                }
                className="text-sm text-center px-1"
              />
              <div className="text-sm font-medium text-center text-foreground">
                ${(item.qty * item.rate).toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeLineItem(item.id)}
                disabled={data.lineItems.length === 1}
                aria-label="Remove line item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1 gap-2"
          onClick={addLineItem}
        >
          <PlusCircle className="h-4 w-4" />
          Add Service
        </Button>
      </section>

      {/* Pricing */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Pricing
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Sub Total (auto)</Label>
            <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted text-sm font-semibold text-foreground">
              ${subTotal.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              id="discount"
              type="number"
              min={0}
              step={0.01}
              value={data.discount}
              onChange={(e) =>
                updateField("discount", parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paymentReceived">Payment Received ($)</Label>
            <Input
              id="paymentReceived"
              type="number"
              min={0}
              step={0.01}
              value={data.paymentReceived}
              onChange={(e) =>
                updateField("paymentReceived", parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Balance (auto)</Label>
            <div className="h-9 flex items-center px-3 rounded-md border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Payment Terms
        </h3>
        <Textarea
          placeholder="e.g. An advance payment of $225 has been received. The remaining balance will be due once the EIN is issued."
          value={data.paymentTerms}
          onChange={(e) => updateField("paymentTerms", e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          onClick={onDownload}
        >
          Download PDF
        </Button>
        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset Form
        </Button>
      </div>
    </div>
  );
}
