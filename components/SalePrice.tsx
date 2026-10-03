import { discountFromPrices, formatPercent, formatUSD } from "@/lib/format";

export function SalePrice({
  msrp,
  salePrice,
  prominent = true,
  align = "right",
}: {
  msrp: number;
  salePrice: number;
  prominent?: boolean;
  align?: "left" | "right";
}) {
  const discount = discountFromPrices(msrp, salePrice);

  return (
    <div className={align === "right" ? "text-left sm:text-right" : "text-left"}>
      {discount > 0 && (
        <p className="text-xs text-gray-400">
          <span className="line-through">{formatUSD(msrp)}</span>
          <span className="ml-2 text-arquiluz-accent">-{formatPercent(discount)}</span>
        </p>
      )}
      <p className={prominent ? "font-serif text-xl" : "text-sm"}>{formatUSD(salePrice)}</p>
    </div>
  );
}
