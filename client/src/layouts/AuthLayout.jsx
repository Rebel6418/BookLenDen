export default function AuthLayout({ children }) {
  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-[#1a1a2e] via-[#2a1b3d] to-[#3d1766]
      relative overflow-hidden p-4
    ">

      {/* glow lights */}
      <div className="absolute w-96 h-96 bg-purple-600/40 blur-[120px] top-10 left-10 rounded-full" />
      <div className="absolute w-96 h-96 bg-pink-500/40 blur-[120px] bottom-10 right-10 rounded-full" />

      {children}
    </div>
  );
}