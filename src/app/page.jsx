import Link from 'next/link'
import { PlayCircle, DollarSign, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+', color: 'bg-blue-100 text-blue-600' },
    { icon: PlayCircle, label: 'Total Views', value: '1M+', color: 'bg-green-100 text-green-600' },
    { icon: DollarSign, label: 'Paid Out', value: '$50K+', color: 'bg-purple-100 text-purple-600' },
    { icon: TrendingUp, label: 'Daily Earnings', value: '$500+', color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 -z-10 rounded-3xl"></div>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Watch Videos &{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Earn Money
            </span>
          </h1>
          <p className="text-xl text-secondary-600 mb-10 max-w-3xl mx-auto">
            Join thousands of users who are earning money by watching video ads. 
            Withdraw your earnings instantly via bKash, Nagad, or Rocket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Start Earning Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/watch" className="btn-secondary text-lg px-8 py-4">
              Browse Ads
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-secondary-500">
            <span className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> No investment</span>
            <span className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Instant withdrawal</span>
            <span className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> 24/7 support</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
            <p className="text-secondary-600">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  )
}