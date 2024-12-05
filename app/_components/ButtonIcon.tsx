type ButtonIconProps = {
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

function ButtonIcon({ children, onClick, disabled }: ButtonIconProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="bg-none border-none p-[0.6rem] rounded-md hover:bg-gray-100 hover:dark:bg-gray-800 text-[2.2rem] text-indigo-600"
    >
      {children}
    </button>
  );
}

export default ButtonIcon;
