type GoogleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
};

export default function GoogleButton({
  onClick,
  disabled = false,
  loading = false,
  label = "Google ile devam et",
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#DCE8E1] bg-white px-4 py-3 text-sm font-medium text-[#193128] transition-colors hover:bg-[#F4FAF6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8E1] border-t-[#1F5D42]"
          />
          <span>Yükleniyor...</span>
        </>
      ) : (
        <>
          {/* Google logosu */}
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2C9.3 39.5 16.1 44 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18l6.7-5.2Z"
            />
            <path
              fill="#EA4335"
              d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.7 29.5 4 24 4 16.1 4 9.3 8.5 5.9 15l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"
            />
          </svg>

          <span>{label}</span>
        </>
      )}
    </button>
  );
}
