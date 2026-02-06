export default function FormWrapper({ children, onSubmit }) {
  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-primary-light
    ">
      <form
        onSubmit={onSubmit}
        className="
          bg-white
          p-8
          rounded-xl
          shadow-lg
          w-full
          max-w-md
          flex
          flex-col
          gap-4
        "
      >
        {children}
      </form>
    </div>
  );
}
