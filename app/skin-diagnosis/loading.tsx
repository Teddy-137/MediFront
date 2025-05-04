export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading skin diagnosis tool...</p>
      </div>
    </div>
  )
}
/*children: p.severity.charAt(0).toUpperCase() + p.severity.slice(1)
            a = t(r, l),
            t = lS(e, n, t, r, void 0, l),
                return ot(e, n, n.type, n.pendingProps, t);

*/