type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
  id: string;
  children: React.ReactNode;
};

function Checkbox({
  checked,
  onChange,
  disabled = false,
  id,
  children,
}: CheckboxProps) {
  return (
    <div className="flex gap-[1.6rem]">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-[2.4rem] w-[2.4rem] outline-offset-2 origin-[0] accent-indigo-600 "
      />
      <label
        htmlFor={!disabled ? id : ""}
        className="flex-1 flex items-center gap-[0.8]"
      >
        {children}
      </label>
    </div>
  );
}

export default Checkbox;
