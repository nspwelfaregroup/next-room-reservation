import TabLinks from "./TabLinks";

/** สลับมุมมอง รายการห้อง / ตารางรวมทุกห้อง */
export default function RoomsViewTabs({ active, date }: { active: "list" | "timeline"; date?: string }) {
  return (
    <TabLinks
      replace
      tabs={[
        { href: "/rooms", label: "🏢 รายการห้อง", active: active === "list" },
        { href: date ? `/schedule?date=${date}` : "/schedule", label: "🗓️ ตารางรวม", active: active === "timeline" }
      ]}
    />
  );
}
