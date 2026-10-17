import { useEffect, useRef, useState } from 'react'

/* ----------------------------- constants ----------------------------- */

const TELEGRAM_ID = 'TheMrHandy'
const TELEGRAM_URL = `https://t.me/${TELEGRAM_ID}`
const EXAM_URL = 'https://themrhandy.github.io/azmoon/'

const NAV_LINKS: [string, string][] = [
  ['#plans', 'سطوح دوره'],
  ['#sample', 'نمونه برنامه'],
  ['#about', 'درباره من'],
  ['#faq', 'سوالات متداول'],
]

type PlanId = 'single' | 's1' | 's2' | 's3'

type SubjectKey = 'zist' | 'shimi' | 'riazi' | 'fizik' | 'zamin' | 'omumi'

const SUBJECTS: Record<SubjectKey, { label: string; bar: string; chip: string; dot: string; text: string; color: string }> = {
  zist:   { label: 'زیست',     bar: 'bg-emerald-500',   chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500',   text: 'text-emerald-400',   color: 'emerald' },
  shimi:  { label: 'شیمی',     bar: 'bg-cyan-500',      chip: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',           dot: 'bg-cyan-500',      text: 'text-cyan-400',      color: 'cyan'    },
  riazi:  { label: 'ریاضی',    bar: 'bg-indigo-500',    chip: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',     dot: 'bg-indigo-500',    text: 'text-indigo-400',    color: 'indigo'  },
  fizik:  { label: 'فیزیک',    bar: 'bg-amber-500',     chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30',        dot: 'bg-amber-500',     text: 'text-amber-400',     color: 'amber'   },
  zamin:  { label: 'زمین',     bar: 'bg-lime-500',      chip: 'bg-lime-500/15 text-lime-300 border-lime-500/30',           dot: 'bg-lime-500',      text: 'text-lime-400',      color: 'lime'    },
  omumi:  { label: 'عمومی',    bar: 'bg-fuchsia-500',   chip: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',  dot: 'bg-fuchsia-500',   text: 'text-fuchsia-400',   color: 'fuchsia' },
}

const toFa = (v: number | string) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
const round1 = (n: number) => Math.round(n * 10) / 10

// نمونه هفته — ساعت‌ها بین ۱۰ تا ۱۱ ساعت، دروس کامل
type DayBlock = { subject: SubjectKey; hours: number }
type DayRow = { day: string; wake: string; start: string; blocks: DayBlock[]; sleep: string; phone: number }

const SAMPLE_WEEK: DayRow[] = [
  {
    day: 'شنبه',
    wake: '۶:۰۰',
    start: '۷:۰۰',
    sleep: '۲۳:۳۰',
    phone: 1.2,
    blocks: [
      { subject: 'zist',  hours: 2.5 },
      { subject: 'shimi', hours: 2.0 },
      { subject: 'riazi', hours: 2.5 },
      { subject: 'omumi', hours: 3.0 },
    ],
  },
  {
    day: 'یکشنبه',
    wake: '۶:۰۰',
    start: '۷:۰۰',
    sleep: '۲۳:۳۰',
    phone: 1.3,
    blocks: [
      { subject: 'zist',  hours: 2.5 },
      { subject: 'shimi', hours: 2.0 },
      { subject: 'fizik', hours: 2.5 },
      { subject: 'zamin', hours: 1.5 },
      { subject: 'omumi', hours: 2.0 },
    ],
  },
  {
    day: 'دوشنبه',
    wake: '۶:۱۵',
    start: '۷:۱۵',
    sleep: '۲۳:۴۵',
    phone: 1.0,
    blocks: [
      { subject: 'riazi', hours: 2.5 },
      { subject: 'zist',  hours: 2.0 },
      { subject: 'shimi', hours: 2.5 },
      { subject: 'fizik', hours: 2.0 },
      { subject: 'zamin', hours: 1.0 },
      { subject: 'omumi', hours: 0.5 },
    ],
  },
  {
    day: 'سه‌شنبه',
    wake: '۶:۰۰',
    start: '۷:۰۰',
    sleep: '۲۳:۳۰',
    phone: 1.4,
    blocks: [
      { subject: 'fizik', hours: 2.5 },
      { subject: 'zist',  hours: 2.5 },
      { subject: 'riazi', hours: 2.0 },
      { subject: 'shimi', hours: 2.0 },
      { subject: 'omumi', hours: 1.5 },
    ],
  },
  {
    day: 'چهارشنبه',
    wake: '۶:۱۵',
    start: '۷:۱۵',
    sleep: '۲۳:۳۰',
    phone: 1.1,
    blocks: [
      { subject: 'zamin', hours: 1.5 },
      { subject: 'shimi', hours: 2.5 },
      { subject: 'fizik', hours: 2.5 },
      { subject: 'zist',  hours: 2.0 },
      { subject: 'riazi', hours: 2.0 },
    ],
  },
  {
    day: 'پنجشنبه',
    wake: '۶:۳۰',
    start: '۷:۳۰',
    sleep: '۰۰:۰۰',
    phone: 1.5,
    blocks: [
      { subject: 'riazi', hours: 2.5 },
      { subject: 'zist',  hours: 2.0 },
      { subject: 'shimi', hours: 2.0 },
      { subject: 'fizik', hours: 2.0 },
      { subject: 'zamin', hours: 1.0 },
      { subject: 'omumi', hours: 1.0 },
    ],
  },
]

const dayTotalHours = (d: DayRow) => round1(d.blocks.reduce((a, b) => a + b.hours, 0))
const subjectTotals = (key: SubjectKey) =>
  SAMPLE_WEEK.reduce((a, d) => a + (d.blocks.find((b) => b.subject === key)?.hours ?? 0), 0)

const WEEK_TOTAL_HOURS = round1(SAMPLE_WEEK.reduce((a, d) => a + dayTotalHours(d), 0))
const AVG_DAILY_HOURS = round1(WEEK_TOTAL_HOURS / SAMPLE_WEEK.length)
const AVG_PHONE = round1(SAMPLE_WEEK.reduce((acc, d) => acc + d.phone, 0) / SAMPLE_WEEK.length)
const MAX_SUBJ_HOURS = Math.max(...(Object.keys(SUBJECTS) as SubjectKey[]).map(subjectTotals))

// لیست کامل امکانات
const S1_FEATURES = [
  'برنامه اختصاصی مطالعه (هفتگی و ماهانه)',
  'مشاوره دقیق و شخصی‌سازی‌شده بر اساس شرایط دانش‌آموز',
  'تماس هفتگی و پیگیری روند مطالعه',
  'بررسی گزارشکار روزانه (تست، ساعت مطالعه، خواب، استراحت، گوشی)',
  'تحلیل آزمون‌های آزمایشی',
  'پیشنهاد دبیر مناسب سطح دانش‌آموز',
  'معرفی منابع مفید و مناسب',
  'آموزش کامل تمام مسیر کنکور از صفر',
  'برنامه ویژه برای دروس عمومی و تخصصی',
]
const S2_FEATURES = [
  ...S1_FEATURES,
  'آزمون‌های هفتگی شخصی‌سازی‌شده',
  'طراحی سوالات آزمون بر اساس نقاط ضعف دانش‌آموز',
]
const S3_FEATURES = [
  ...S2_FEATURES,
  'رفع اشکال',
]

const PLANS = [
  { id: 's1' as PlanId, name: 'سطح ۱', subtitle: 'مشاوره شخصی‌سازی‌شده + پیگیری هفتگی', price: '۱.۸', features: S1_FEATURES },
  { id: 's2' as PlanId, name: 'سطح ۲', subtitle: 'سطح ۱ + آزمون‌های هفتگی شخصی‌سازی‌شده', price: '۲.۴', features: S2_FEATURES, best: true },
  { id: 's3' as PlanId, name: 'سطح ۳', subtitle: 'سطح ۲ + رفع اشکال', price: '۳.۲', features: S3_FEATURES },
]

const SINGLE_SESSION = {
  duration: '۳۰ دقیقه',
  price: '۳۰۰',
  features: [
    'بررسی وضعیت تحصیلی و هدف شما',
    'بررسی روند مطالعه و پیشنهاد راهکار مشخص',
    'معرفی سطح مناسب برای همکاری',
    'پاسخ به سوال‌های درسی و روش مطالعه',
  ],
}

const REPORT_FIELDS = [
  'تعداد تست (به تفکیک درس)',
  'ساعت مطالعه (به تفکیک درس)',
  'ساعت خواب و بیداری',
  'ساعت‌های مطالعه و استراحت',
  'تایم استفاده از گوشی',
]

const FAQS = [
  {
    q: 'سطوح دوره چه تفاوتی با هم دارند؟',
    a: 'سطح ۱ شامل برنامه اختصاصی، مشاوره دقیق و شخصی‌سازی‌شده، تماس هفتگی، گزارشکار روزانه، تحلیل آزمون، پیشنهاد دبیر، معرفی منابع و آموزش کامل مسیر کنکور است. سطح ۲ علاوه بر همه این موارد، آزمون‌های هفتگی شخصی‌سازی‌شده دارد و سطح ۳ علاوه بر امکانات سطح ۱ و ۲ شامل رفع اشکال می‌شود.',
  },
  {
    q: 'قیمت‌ها چقدر است و تخفیف دارید؟',
    a: 'قیمت‌ها ماهانه و بدون تخفیف است: سطح ۱ ماهانه ۱.۸ میلیون تومان، سطح ۲ ماهانه ۲.۴ میلیون تومان و سطح ۳ ماهانه ۳.۲ میلیون تومان. مشاوره تک‌جلسه ۳۰ دقیقه‌ای ۳۰۰ هزار تومان است.',
  },
  {
    q: 'مشاوره تک‌جلسه چیست؟',
    a: 'یک جلسه ۳۰ دقیقه‌ای با هزینه ۳۰۰ هزار تومان که در آن وضعیت تحصیلی شما بررسی می‌شود و پاسخ سوال‌های درسی و روش مطالعه را دریافت می‌کنید.',
  },
  {
    q: 'گزارشکار روزانه شامل چه مواردی است؟',
    a: 'تعداد تست به تفکیک هر درس، ساعت مطالعه به تفکیک هر درس، ساعت خواب و بیداری، ساعت‌های مطالعه و استراحت، و تایم استفاده از گوشی.',
  },
  {
    q: 'برنامه برای کدام دروس است؟',
    a: 'در همه سطوح برنامه ویژه برای دروس عمومی و تخصصی (زیست، شیمی، ریاضی، فیزیک و زمین) ارائه می‌شود.',
  },
  {
    q: 'ساعت مطالعه چقدر است؟',
    a: 'ساعت مطالعه به‌صورت تدریجی و پیوسته افزایش پیدا می‌کند و بر اساس سطح، پایه و توان دانش‌آموز قابل تنظیم است. نمونه برنامه‌ی سایت یک هفته‌ی میانی با ۱۰ تا ۱۱ ساعت مطالعه در روز است.',
  },
  {
    q: 'فرم سایت درخواست را مستقیم می‌فرستد؟',
    a: 'خیر. فرم فقط متن پیام را آماده می‌کند. بعد از باز شدن تلگرام باید خودت دکمه ارسال را بزنی.',
  },
  {
    q: 'اگر برنامه اجرا نشد چه می‌شود؟',
    a: 'در گزارشکارهای روزانه علت بررسی می‌شود و برنامه هفته بعد متناسب با شرایط واقعی تو بازنویسی می‌شود.',
  },
]

/* ----------------------------- helper components ----------------------------- */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setShow(true); io.disconnect() }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const PHOTO_URL = `${import.meta.env.BASE_URL}images/alireza.jpg`

function Avatar({ className = '', small = false }: { className?: string; small?: boolean }) {
  return (
    <div className={`${className} relative overflow-hidden`}>
      <img
        src={PHOTO_URL}
        alt="علیرضا غلامی، مشاور تخصصی کنکور"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: small ? '50% 22%' : '50% 20%' }}
      />
      {!small && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />}
    </div>
  )
}

/* ----------------------------- app ----------------------------- */

export default function App() {
  const [scrolled, setScrolled] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sampleDay, setSampleDay] = useState(0)
  const [form, setForm] = useState({ name: '', grade: '', field: '', phone: '', goal: '' })
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('s1')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500) }

  const planLabel =
    selectedPlan === 'single' ? 'مشاوره تک‌جلسه (۳۰ دقیقه)' :
    PLANS.find((p) => p.id === selectedPlan)?.name ?? ''

  const telegramMessage = `سلام آقای غلامی، درخواست مشاوره دارم.
نام: ${form.name}
پایه: ${form.grade}
رشته: ${form.field}
هدف و شرایط فعلی: ${form.goal}
شماره تماس: ${form.phone}
خدمت مورد نظر: ${planLabel}`

  const day = SAMPLE_WEEK[sampleDay]

  return (
    <div id="top" className="min-h-screen bg-[#07070A] text-white selection:bg-accent selection:text-black overflow-x-hidden" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
      <style>{`
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:#2a2a33;border-radius:999px}
        ::-webkit-scrollbar-track{background:#0a0a0f}
      `}</style>

      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full text-sm font-bold shadow-2xl">{toast}</div>}

      {/* NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 border-b ${scrolled > 20 || mobileMenu ? 'bg-[#07070A]/90 backdrop-blur-xl border-white/10' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <Avatar small className="w-9 h-9 shrink-0 rounded-full border border-white/20" />
            <div className="min-w-0">
              <div className="text-[13px] font-black leading-none">علیرضا غلامی</div>
              <div className="text-[10px] opacity-60 mt-1">مشاور تخصصی کنکور</div>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-7 text-[13px]">
            {NAV_LINKS.map(([h, l]) => (
              <a key={h} href={h} className="opacity-70 hover:opacity-100 transition">{l}</a>
            ))}
            <a href={EXAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-accent/40 text-accent px-4 py-1.5 rounded-full font-bold hover:bg-accent hover:text-black transition">
              آزمون <span aria-hidden>↗</span>
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <a href="#contact" className="hidden sm:inline-flex bg-accent text-black px-5 py-2.5 rounded-full text-sm font-black hover:brightness-110 transition">درخواست مشاوره</a>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden w-10 h-10 grid place-items-center border border-white/15 rounded-full"
              aria-label="منو"
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? (
                <span className="text-sm leading-none">✕</span>
              ) : (
                <div className="space-y-1"><div className="w-4 h-0.5 bg-white" /><div className="w-4 h-0.5 bg-white" /><div className="w-4 h-0.5 bg-white" /></div>
              )}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden border-t border-white/10 bg-[#0B0B10]">
            <div className="max-w-[1280px] mx-auto px-5 py-2 flex flex-col">
              {[...NAV_LINKS, ['#contact', 'درخواست مشاوره'] as [string, string]].map(([h, l]) => (
                <a key={h} href={h} onClick={() => setMobileMenu(false)} className="flex items-center justify-between py-4 border-b border-white/5 text-[15px] font-bold">
                  {l}
                  <span className="opacity-30" aria-hidden>‹</span>
                </a>
              ))}
              <a href={EXAM_URL} target="_blank" rel="noreferrer" onClick={() => setMobileMenu(false)} className="my-4 flex items-center justify-between rounded-2xl bg-accent text-black px-5 py-4 font-black">
                ورود به آزمون <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 pt-28 pb-14 lg:pt-36 lg:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.8fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 text-xs text-accent font-bold">
                <span className="w-8 h-px bg-accent" />
                مشاوره کنکور ۱۴۰۶
              </div>
              <h1 className="mt-6 text-[34px] sm:text-[50px] lg:text-[62px] font-black leading-[1.2] tracking-tight">
                برنامه‌ای که<br />
                هر هفته با گزارش تو<br />
                <span className="text-accent">دقیق‌تر می‌شود.</span>
              </h1>
              <p className="mt-6 text-[15px] leading-8 opacity-65 max-w-[520px]">
                هر شب گزارشکار روزانه‌ات را می‌فرستی؛ من هم هفته بعد، برنامه را بر اساس عددهای واقعی خودت بازنویسی می‌کنم.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#contact" className="bg-accent text-black px-7 py-3.5 rounded-full font-black text-sm text-center hover:brightness-110 transition">درخواست مشاوره ←</a>
                <a href="#plans" className="border border-white/20 px-7 py-3.5 rounded-full font-bold text-sm text-center hover:bg-white hover:text-black transition">دیدن سطوح دوره</a>
              </div>
              <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-xs opacity-70">
                <span>رتبه ۳۴۲ منطقه یک تجربی ۱۴۰۴</span>
                <span>دندان‌پزشکی دانشگاه یزد</span>
              </div>
            </div>

            <div className="relative isolate">
              <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[28px] border border-accent/30" />
              <div className="relative rounded-[28px] overflow-hidden border border-white/10 h-[420px] lg:h-[540px]">
                <Avatar className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2.5 text-xs">
          {['برنامه ویژه دروس عمومی و تخصصی', 'گزارشکار روزانه', 'تماس و پیگیری هفتگی', 'قیمت ماهانه و بدون تخفیف'].map((t) => (
            <div key={t} className="flex items-center gap-2 opacity-80">
              <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-accent" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* METHOD */}
      <section className="relative bg-[#07070A]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12">
          <Reveal>
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="text-xs text-accent font-bold mb-4">روش کار</div>
              <h2 className="text-[32px] lg:text-[44px] font-black leading-[1.05]">
                یک چرخه‌ی ساده که<br />
                <span className="text-accent">هر هفته تکرار می‌شود</span>
              </h2>
              <p className="mt-6 opacity-60 leading-7 text-sm max-w-[520px]">
                اول تو را می‌شناسم، بعد برنامه می‌نویسم. هر شب عددهای واقعی‌ات را در گزارشکار می‌بینم و هفته بعد برنامه را با همان عددها اصلاح می‌کنم.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { k: 'هر شب', l: 'گزارشکار روزانه' },
                  { k: 'هر هفته', l: 'تماس و بازنویسی برنامه' },
                  { k: '۶ درس', l: 'عمومی و تخصصی' },
                ].map((s) => (
                  <div key={s.l} className="bg-white text-black rounded-2xl p-4">
                    <div className="font-black text-sm">{s.k}</div>
                    <div className="text-[11px] opacity-60 mt-1 leading-4">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="space-y-5">
            {[
              { n: '۰۱', t: 'شناخت کامل', d: 'پیش از شروع، فرم شناخت دقیق از وضعیت درسی، ساعت خواب، مدرسه و آزمون‌های قبلی پر می‌شود تا برنامه واقعاً برای تو نوشته شود.', tags: ['فرم شناخت', 'تحلیل کارنامه', 'اهداف'] },
              { n: '۰۲', t: 'برنامه اختصاصی', d: 'برنامه هفتگی با ساعت مطالعه افزایشی و پیوسته (قابل تنظیم)، تقسیم دروس زیست، شیمی، ریاضی، فیزیک، زمین و عمومی، و مباحث مشخص برای هر درس.', tags: ['ساعت‌بندی', 'مباحث هر درس', 'جمع‌بندی'] },
              { n: '۰۳', t: 'پیگیری و گزارشکار روزانه', d: 'گزارشکار روزانه شامل تعداد تست به تفکیک درس، ساعت مطالعه هر درس، ساعت خواب و بیداری، استراحت و تایم گوشی. بر اساس آن برنامه هفته بعد بازنویسی می‌شود.', tags: ['گزارش روزانه', 'تماس هفتگی', 'اصلاح برنامه'] },
            ].map((c, i) => (
              <Reveal key={c.n} delay={i * 100}>
                <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-7">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="w-11 h-11 rounded-full bg-white text-black grid place-items-center font-black text-sm">{toFa(c.n)}</div>
                    <div className="flex gap-2 flex-wrap">
                      {c.tags.map((t) => <span key={t} className="text-[10px] bg-white/10 border border-white/10 px-2 py-1 rounded-full">{t}</span>)}
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-black">{c.t}</h3>
                  <p className="mt-3 text-sm leading-6 opacity-60">{c.d}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={350}>
              <div className="rounded-[24px] border border-accent/30 bg-[#0F0F14] p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-black">یک هفته از برنامه را ببین</div>
                  <div className="text-xs opacity-60 mt-1">ساعت‌بندی روزانه‌ی هر درس</div>
                </div>
                <a href="#sample" className="bg-accent text-black px-5 py-3 rounded-full text-xs font-black">مشاهده ↓</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="relative bg-[#0A0A0F] border-y border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 border border-accent/30 px-3 py-1.5 rounded-full text-xs text-accent font-bold">
              سه سطح دوره
            </div>
            <h2 className="mt-4 text-[36px] lg:text-[52px] font-black leading-none">انتخاب مسیرت</h2>
            <p className="mt-3 text-sm opacity-60 max-w-[640px] leading-6">
              هزینه‌ها ماهانه و بدون تخفیف است. امکانات هر سطح کامل نوشته شده؛ در سطوح ۲ و ۳ همه امکانات سطوح قبلی نیز وجود دارد.
            </p>
          </Reveal>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, idx) => (
              <Reveal key={plan.id} delay={idx * 120}>
                <div className={`relative h-full rounded-[32px] p-[1px] bg-gradient-to-b ${plan.best ? 'from-accent to-accent/30' : 'from-zinc-700 to-zinc-900'}`}>
                  <div className="bg-[#0F0F14] rounded-[31px] p-7 h-full flex flex-col">
                    {plan.best && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[11px] font-black px-3 py-1 rounded-full">
                        پیشنهاد ویژه
                      </div>
                    )}
                    <h3 className="font-black text-lg">{plan.name}</h3>
                    <p className="text-xs opacity-60 mt-2 leading-5">{plan.subtitle}</p>
                    <div className="mt-6 flex items-baseline gap-2">
                      <div className="text-[44px] font-black leading-none">{toFa(plan.price)}</div>
                      <div className="text-xs opacity-60 leading-4">میلیون تومان<br />ماهانه</div>
                    </div>
                    <div className="mt-6 space-y-2.5 flex-1">
                      {plan.features.map((f, i) => {
                        const isNewInS2 = plan.id === 's2' && i === S1_FEATURES.length
                        const isNewInS3 = plan.id === 's3' && i >= S2_FEATURES.length
                        const isNewInAny = (plan.id === 's2' && i >= S1_FEATURES.length) || (plan.id === 's3' && i >= S2_FEATURES.length)
                        return (
                          <div key={f + i} className="flex gap-2.5 text-[13px] leading-5 items-start">
                            <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] ${isNewInAny ? 'bg-accent text-black' : 'bg-white/10'}`}>✓</span>
                            <span className="opacity-90">{f}</span>
                            {isNewInS2 && <span className="mr-auto shrink-0 whitespace-nowrap text-[10px] bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full">جدید در سطح ۲</span>}
                            {isNewInS3 && <span className="mr-auto shrink-0 whitespace-nowrap text-[10px] bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full">جدید در سطح ۳</span>}
                          </div>
                        )
                      })}
                    </div>
                    <button onClick={() => { setSelectedPlan(plan.id); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} className={`mt-8 w-full py-4 rounded-full font-black text-sm transition hover:scale-[0.98] ${plan.best ? 'bg-accent text-black' : 'bg-white text-black'}`}>
                      انتخاب {plan.name} ←
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Single session */}
          <Reveal>
            <div className="mt-8 grid lg:grid-cols-[1fr_1.1fr] gap-6 bg-white/[0.03] border border-white/10 rounded-[32px] p-7 lg:p-10">
              <div>
                <div className="inline-flex text-[11px] bg-white text-black px-3 py-1 rounded-full font-black">مشاوره تک‌جلسه</div>
                <h3 className="mt-4 text-2xl lg:text-3xl font-black leading-tight">یک جلسه، بدون تعهد</h3>
                <p className="mt-3 text-sm opacity-70 leading-6">
                  اگر هنوز مطمئن نیستی، یک جلسه {toFa(SINGLE_SESSION.duration)}‌ای با هزینه {toFa(SINGLE_SESSION.price)} هزار تومان داشته باش.
                </p>
              </div>
              <div className="bg-[#0F0F14] border border-white/10 rounded-3xl p-6">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs opacity-60">مدت جلسه: {SINGLE_SESSION.duration}</div>
                    <div className="text-3xl font-black mt-1">{toFa(SINGLE_SESSION.price)} هزار تومان</div>
                  </div>
                  <button onClick={() => { setSelectedPlan('single'); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-white text-black px-6 py-3 rounded-full font-black text-sm">
                    رزرو جلسه ←
                  </button>
                </div>
                <div className="mt-5 space-y-2.5">
                  {SINGLE_SESSION.features.map((f) => (
                    <div key={f} className="flex gap-2.5 text-[13px] leading-5">
                      <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-white/10 grid place-items-center text-[10px]">✓</span>
                      <span className="opacity-90">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Report fields card */}
          <Reveal>
            <div className="mt-8 bg-white/[0.04] border border-white/10 rounded-[24px] p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-black text-lg">گزارشکار روزانه (همه سطوح)</h4>
                <span className="text-xs opacity-60">هر هفته بر اساس گزارش‌های روزانه، برنامه اصلاح می‌شود</span>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {REPORT_FIELDS.map((f) => (
                  <div key={f} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center text-xs font-bold leading-5">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Comparison */}
          <Reveal>
            <div className="mt-8 bg-white rounded-[24px] overflow-hidden text-black">
              <div className="px-6 lg:px-8 py-6 border-b border-black/5">
                <h4 className="font-black text-lg">مقایسه سریع سطوح</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] sm:text-sm">
                  <thead className="bg-zinc-50 text-xs opacity-70">
                    <tr>
                      <th className="text-right p-3 sm:p-4 font-bold">امکانات</th>
                      <th className="p-2 sm:p-4 whitespace-nowrap">سطح ۱</th>
                      <th className="p-2 sm:p-4 bg-accent/20 whitespace-nowrap">سطح ۲</th>
                      <th className="p-2 sm:p-4 whitespace-nowrap">سطح ۳</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['برنامه اختصاصی هفتگی / ماهانه', '✓', '✓', '✓'],
                      ['مشاوره دقیق و شخصی‌سازی‌شده', '✓', '✓', '✓'],
                      ['تماس هفتگی + گزارشکار روزانه', '✓', '✓', '✓'],
                      ['تحلیل آزمون، دبیر و منبع', '✓', '✓', '✓'],
                      ['برنامه ویژه برای دروس عمومی و تخصصی', '✓', '✓', '✓'],
                      ['آموزش کامل مسیر کنکور', '✓', '✓', '✓'],
                      ['آزمون هفتگی شخصی‌سازی‌شده', '—', '✓', '✓'],
                      ['رفع اشکال', '—', '—', '✓'],
                      ['هزینه ماهانه', '۱.۸ م', '۲.۴ م', '۳.۲ م'],
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-black/5">
                        <td className="p-3 sm:p-4 font-medium leading-5">{row[0]}</td>
                        <td className="p-2 sm:p-4 text-center whitespace-nowrap">{row[1]}</td>
                        <td className="p-2 sm:p-4 text-center bg-accent/10 font-black whitespace-nowrap">{row[2]}</td>
                        <td className="p-2 sm:p-4 text-center whitespace-nowrap">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SAMPLE PLAN */}
      <section id="sample" className="relative bg-[#07070A] py-16 lg:py-24 border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-xs text-accent font-bold">نمونه برنامه</div>
            <h2 className="mt-3 text-[32px] lg:text-[44px] font-black leading-none">نمونه برنامه هفتگی</h2>
            <p className="mt-4 text-sm opacity-60 leading-6 max-w-[720px]">
              این یک نمونه آموزشی از یک هفته‌ی میانی دوره است. در برنامه‌ی واقعی، ساعت مطالعه به‌تدریج بالا می‌رود و بر اساس شرایط تو تنظیم می‌شود.
            </p>
          </Reveal>

          {/* Weekly totals */}
          <Reveal>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { k: toFa(AVG_DAILY_HOURS), l: 'میانگین ساعت مطالعه روزانه' },
                { k: toFa(WEEK_TOTAL_HOURS), l: 'ساعت مطالعه هفته' },
                { k: toFa(AVG_PHONE), l: 'میانگین تایم گوشی (ساعت)' },
              ].map((c) => (
                <div key={c.l} className="bg-white text-black rounded-2xl p-4">
                  <div className="text-2xl font-black">{c.k}</div>
                  <div className="text-[11px] opacity-60 mt-1 leading-4">{c.l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Subject totals bars */}
          <Reveal>
            <div className="mt-6 bg-white text-black rounded-[32px] p-6 lg:p-8">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-black text-lg">جمع ساعت مطالعه‌ی هفته به تفکیک درس</h3>
              </div>
              <div className="mt-6 grid gap-6">
                <div className="space-y-4">
                  <div className="text-xs font-black opacity-60">ساعت مطالعه</div>
                  {(Object.keys(SUBJECTS) as SubjectKey[]).map((k) => {
                    const total = subjectTotals(k)
                    return (
                      <div key={k} className="flex items-center gap-3 text-xs">
                        <span className="w-14 font-bold">{SUBJECTS[k].label}</span>
                        <div className="flex-1 h-3 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${SUBJECTS[k].bar} rounded-full`} style={{ width: `${(total / MAX_SUBJ_HOURS) * 100}%` }} />
                        </div>
                        <span className="w-12 text-left font-black">{toFa(total)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Day selector */}
          <Reveal>
            <div className="mt-8 bg-white text-black rounded-[32px] p-6 lg:p-8">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SAMPLE_WEEK.map((d, i) => (
                  <button key={d.day} onClick={() => setSampleDay(i)} className={`px-4 py-3 rounded-full text-xs font-black whitespace-nowrap transition border ${sampleDay === i ? 'bg-black text-white border-black' : 'bg-zinc-100 border-black/5 hover:bg-zinc-200'}`}>
                    {d.day}
                    <span className="opacity-60 font-normal mr-1">• {toFa(dayTotalHours(d))} ساعت</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                {/* Blocks */}
                <div className="bg-zinc-50 border border-black/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-xs opacity-60">روز</div>
                      <div className="text-2xl font-black">{day.day}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">شروع: {toFa(day.start)}</div>
                      <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">بیداری: {toFa(day.wake)}</div>
                      <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">خواب: {toFa(day.sleep)}</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {day.blocks.map((b, i) => (
                      <div key={i} className="bg-white border border-black/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${SUBJECTS[b.subject].dot}`} />
                            <span className="font-black text-sm">{SUBJECTS[b.subject].label}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[11px] bg-zinc-100 px-2 py-1 rounded-full font-bold">{toFa(b.hours)} ساعت مطالعه</span>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${SUBJECTS[b.subject].bar} rounded-full`} style={{ width: `${(b.hours / dayTotalHours(day)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white border border-black/5 rounded-xl py-2.5">
                      <div className="font-black text-sm">{toFa(dayTotalHours(day))} ساعت</div>
                      <div className="opacity-60 text-[10px]">مطالعه کل</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-xl py-2.5">
                      <div className="font-black text-sm">{toFa(day.phone)} ساعت</div>
                      <div className="opacity-60 text-[10px]">گوشی</div>
                    </div>
                  </div>
                </div>

                {/* Daily metrics */}
                <div className="bg-zinc-50 border border-black/5 rounded-3xl p-6">
                  <div className="text-xs opacity-60 font-bold">خلاصه روز</div>
                  <div className="mt-4 space-y-3">
                    {day.blocks.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-14 font-bold">{SUBJECTS[b.subject].label}</span>
                        <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${SUBJECTS[b.subject].bar} rounded-full`} style={{ width: `${(b.hours / dayTotalHours(day)) * 100}%` }} />
                        </div>
                        <span className="w-16 text-left opacity-70">{toFa(b.hours)} ساعت</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-white border border-black/5 rounded-2xl p-4">
                      <div className="text-[11px] opacity-60">استراحت بین بلوک‌ها</div>
                      <div className="font-black text-sm mt-1">۱۵-۲۰ دقیقه</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-2xl p-4">
                      <div className="text-[11px] opacity-60">زمان مرور شبانه</div>
                      <div className="font-black text-sm mt-1">۳۰ دقیقه</div>
                    </div>
                    <div className="bg-white border border-black/5 rounded-2xl p-4 col-span-2">
                      <div className="text-[11px] opacity-60">جمعه</div>
                      <div className="font-black text-sm mt-1">مرور هفته + اصلاح اشتباهات</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative bg-[#0A0A0F] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          <Reveal>
            <div className="relative h-[460px] lg:h-[560px] rounded-[32px] overflow-hidden border border-white/10">
              <Avatar className="w-full h-full" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1.5 text-xs">
                <span className="bg-white text-black px-2 py-0.5 rounded-full font-black text-[10px]">درباره من</span>
                <span className="opacity-70">علیرضا غلامی</span>
              </div>
              <h2 className="mt-6 text-[30px] lg:text-[40px] font-black leading-tight">
                مسیر را خودم رفته‌ام؛<br />
                <span className="text-accent">می‌دانم کجاها گیر می‌کنی.</span>
              </h2>
              <p className="mt-6 text-sm leading-7 opacity-70">
                تجربه پشت‌کنکور را خودم گذرانده‌ام. می‌دانم برنامه سنگین چه بلایی سر انگیزه می‌آورد و می‌دانم اهمیت گزارشکار دقیق چیست. سبک مشاوره من بر اساس شناخت واقعی دانش‌آموز، برنامه قابل اجرا و پیگیری هفتگی منظم است.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="bg-white text-black rounded-3xl p-5">
                  <div className="text-xs opacity-60">رتبه</div>
                  <div className="text-xl font-black mt-1">۳۴۲ منطقه یک</div>
                  <div className="text-xs opacity-60 mt-1">تجربی ۱۴۰۴</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                  <div className="text-xs opacity-60">رشته / دانشگاه</div>
                  <div className="text-xl font-black mt-1">دندان‌پزشکی</div>
                  <div className="text-xs opacity-60 mt-1">دانشگاه یزد</div>
                </div>
                <div className="bg-accent text-black rounded-3xl p-5 sm:col-span-2">
                  <div className="text-xs opacity-70">تجربه</div>
                  <div className="text-lg font-black mt-1">پشت‌کنکور + مشاوره دقیق</div>
                  <div className="text-xs opacity-80 mt-1 leading-5">همراه با آزمون‌های هفتگی روند پیشرفت را سریع‌تر می‌کند</div>
                </div>
              </div>

              <a href="#contact" className="mt-8 inline-flex bg-white text-black px-6 py-3.5 rounded-full font-black text-sm">درخواست مشاوره ←</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#07070A] py-16 lg:py-24 border-t border-white/5">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <div className="inline-flex bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs">سوالات متداول</div>
              <h2 className="mt-4 text-[32px] font-black">سوال‌های پرتکرار</h2>
              <p className="mt-2 text-sm opacity-60">جواب سوالت این‌جا نبود؟ مستقیم در تلگرام بپرس.</p>
            </div>
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`rounded-3xl border transition ${openFaq === i ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-right p-6 flex items-center justify-between gap-4">
                  <span className="font-bold text-sm leading-6">{f.q}</span>
                  <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center border text-sm transition ${openFaq === i ? 'bg-black text-white border-black rotate-45' : 'bg-white/10 border-white/10'}`}>+</span>
                </button>
                {openFaq === i && <div className="px-6 pb-6 text-sm leading-7 opacity-80">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative bg-[#0A0A0F] py-16 lg:py-24 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 border border-accent/30 text-accent font-bold px-3 py-1 rounded-full text-xs">درخواست مشاوره</div>
              <h2 className="mt-4 text-[30px] lg:text-[40px] font-black leading-tight">اول یک پیام بده</h2>
              <p className="mt-4 text-sm opacity-60 leading-6">
                فرم را پر کن، پیش‌نمایش پیام را ببین و در تلگرام ارسال کن. <span className="text-white font-bold">این فرم به‌تنهایی درخواست را ارسال نمی‌کند</span>؛ ارسال نهایی با خودت است.
              </p>

              <div className="mt-8 bg-white text-black rounded-[24px] p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold">نام و نام خانوادگی *</span>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: علی حسینی" className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-black" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold">پایه / وضعیت *</span>
                    <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none">
                      <option value="">انتخاب کن</option>
                      <option>دهم</option><option>یازدهم</option><option>دوازدهم</option><option>پشت‌کنکور</option>
                    </select>
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold">رشته</span>
                    <select value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none">
                      <option value="">انتخاب کن</option><option>تجربی</option><option>ریاضی</option><option>انسانی</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold">شماره تماس *</span>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲..." dir="ltr" className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none text-left" />
                  </label>
                </div>
                <label className="space-y-1.5 block">
                  <span className="text-xs font-bold">هدف و شرایط فعلی</span>
                  <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} rows={3} placeholder="مثلاً: دوازدهم تجربی، تراز ۶۰۰۰، مشکل اصلی فیزیک و مدیریت زمان..." className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none resize-none" />
                </label>

                <div className="bg-zinc-50 border border-black/5 rounded-2xl p-4">
                  <div className="text-xs font-black">خدمت مورد نظر</div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button onClick={() => setSelectedPlan('single')} className={`p-3 rounded-2xl border text-xs font-bold leading-5 transition ${selectedPlan === 'single' ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:bg-zinc-100'}`}>
                      تک‌جلسه<br /><span className="opacity-60 font-normal">۳۰۰ هزار</span>
                    </button>
                    {PLANS.map((p) => (
                      <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`p-3 rounded-2xl border text-xs font-bold leading-5 transition ${selectedPlan === p.id ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:bg-zinc-100'}`}>
                        {p.name}<br /><span className="opacity-60 font-normal">{toFa(p.price)} م / ماه</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => {
                  if (!form.name || !form.grade || !form.phone) { notify('لطفاً نام، پایه و شماره را کامل کن'); return }
                  setShowModal(true)
                }} className="w-full bg-black text-white py-4 rounded-full font-black text-sm hover:bg-zinc-900 transition">
                  پیش‌نمایش پیام و ارسال در تلگرام ←
                </button>
                <div className="text-center text-[11px] opacity-60">
                  یا مستقیم به <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" dir="ltr" className="underline font-bold">@{TELEGRAM_ID}</a> پیام بده
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-6">
              <div className="bg-accent text-black rounded-[32px] p-8">
                <div className="text-xs opacity-70">مشاوره تک‌جلسه</div>
                <h3 className="mt-3 text-2xl font-black leading-8">جلسه {toFa(SINGLE_SESSION.duration)}‌ای</h3>
                <p className="mt-3 text-sm opacity-80 leading-6">{toFa(SINGLE_SESSION.price)} هزار تومان، برای شناخت اولیه و انتخاب مسیر.</p>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-[32px] p-6">
                <h4 className="font-black">مراحل بعد از ارسال</h4>
                <ol className="mt-4 space-y-3 text-xs leading-5">
                  <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-white text-black grid place-items-center font-black text-[11px]">۱</span>ارسال پیام در تلگرام</li>
                  <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-white/10 border border-white/10 grid place-items-center font-black text-[11px]">۲</span>هماهنگی جلسه / شروع دوره</li>
                  <li className="flex gap-3"><span className="w-6 h-6 shrink-0 rounded-full bg-accent text-black grid place-items-center font-black text-[11px]">۳</span>دریافت فرم شناخت و اولین برنامه</li>
                </ol>
              </div>

              <div className="bg-white text-black rounded-[24px] p-6 flex items-center gap-4">
                <Avatar small className="w-12 h-12 shrink-0 rounded-full" />
                <div>
                  <div className="font-black text-sm">علیرضا غلامی</div>
                  <div className="text-xs opacity-60">مشاوره تخصصی کنکور</div>
                </div>
                <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="mr-auto bg-[#2AABEE] text-white px-4 py-2 rounded-full text-xs font-black">تلگرام</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-[24px] max-w-[560px] w-full overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="font-black">مرحله آخر: ارسال پیام در تلگرام</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 grid place-items-center" aria-label="بستن">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs leading-5">درخواست شما هنوز ارسال نشده است. در تلگرام باید خودت دکمه ارسال را بزنی.</div>
              <div className="mt-4 bg-zinc-50 border border-black/5 rounded-2xl p-4 text-xs leading-6 whitespace-pre-wrap">{telegramMessage}</div>
              <a href={`https://t.me/${TELEGRAM_ID}?text=${encodeURIComponent(telegramMessage)}`} target="_blank" rel="noreferrer" onClick={() => { setShowModal(false); notify('در تلگرام حتماً دکمه ارسال را بزن') }} className="mt-4 w-full bg-[#2AABEE] text-white py-4 rounded-full font-black text-sm text-center block">
                بازکردن تلگرام و ارسال درخواست ←
              </a>
              <button onClick={() => { navigator.clipboard?.writeText(telegramMessage); notify('متن کپی شد') }} className="mt-3 w-full bg-zinc-100 py-3 rounded-full font-bold text-sm">کپی متن پیام</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black border-t border-white/5 py-10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex flex-wrap gap-6 items-center justify-between text-xs opacity-60">
          <div>© ۱۴۰۵ علیرضا غلامی — مشاوره تخصصی کنکور</div>
          <div className="flex flex-wrap gap-4 items-center">
            <a href="#plans" className="hover:opacity-100">سطوح دوره</a><span>•</span>
            <a href={EXAM_URL} target="_blank" rel="noreferrer" className="hover:opacity-100">آزمون</a><span>•</span>
            <a href="#faq" className="hover:opacity-100">سوالات متداول</a><span>•</span>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" dir="ltr" className="underline">@{TELEGRAM_ID}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
