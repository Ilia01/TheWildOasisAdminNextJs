type InputProps = {
  type: string;
  id: string;
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
};

function Input({
  type,
  id,
  autoComplete,
  value,
  onChange,
  disabled,
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      name={type}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="rounded-md border border-gray-300 bg-white px-[1.2rem] py-[0.8rem] shadow-[0_0_0_rgba(0,0,0,0.04)] dark:border-gray-600 dark:bg-gray-0 dark:shadow-[0_0_0_rgba(0,0,0,0.4)]"
    />
  );
}

export default Input;
