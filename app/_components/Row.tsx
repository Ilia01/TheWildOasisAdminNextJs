type RowProps = {
  children: React.ReactNode;
  type?: "vertical" | "horizontal";
};

function Row({ children, type = "vertical" }: RowProps) {
  return (
    <div
      className={`flex ${type === "vertical" ? "flex-col gap-[2.5rem]" : "items-center justify-between"}`}
    >
      {children}
    </div>
  );
}

export default Row;
