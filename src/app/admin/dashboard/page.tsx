import { 
  BookOpen, 
  FolderKanban, 
  HelpCircle, 
  Briefcase,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

const stats = [
  { name: "Blogginlägg", value: "0", icon: BookOpen, href: "/admin/content/blog", color: "bg-blue-500" },
  { name: "Projekt", value: "0", icon: FolderKanban, href: "/admin/content/projects", color: "bg-emerald-500" },
  { name: "FAQ", value: "0", icon: HelpCircle, href: "/admin/content/faq", color: "bg-amber-500" },
  { name: "Lediga Tjänster", value: "0", icon: Briefcase, href: "/admin/content/jobs", color: "bg-purple-500" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Dashboard</h1>
        <p className="text-slate-500 mt-2">Välkommen tillbaka! Här är en översikt av ditt innehåll.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Link href={stat.href} className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="mt-4">
                <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 font-outfit mb-6">Snabba åtgärder</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/content/blog/new" className="p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors text-center border border-slate-100">
              <span className="block font-bold text-slate-900">Nytt Blogginlägg</span>
            </Link>
            <Link href="/admin/content/projects/new" className="p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors text-center border border-slate-100">
              <span className="block font-bold text-slate-900">Nytt Projekt</span>
            </Link>
            <Link href="/admin/content/faq/new" className="p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors text-center border border-slate-100">
              <span className="block font-bold text-slate-900">Ny FAQ</span>
            </Link>
            <Link href="/admin/content/jobs/new" className="p-4 bg-slate-50 rounded-xl hover:bg-purple-50 transition-colors text-center border border-slate-100">
              <span className="block font-bold text-slate-900">Ny Tjänst</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <SettingsIcon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-outfit">Systemstatus</h3>
            <p className="text-slate-500">Allt system rullar på som det ska.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Online</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );
}
