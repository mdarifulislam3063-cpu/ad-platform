import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import WithdrawalTable from '@/components/WithdrawalTable'

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const withdrawals = await prisma.payment.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Withdrawal Requests</h1>
      <WithdrawalTable withdrawals={withdrawals} />
    </div>
  )
}