export const metadata = {
  title: 'SimpleChat',
  description: 'A simple chat to connect with your friends.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
