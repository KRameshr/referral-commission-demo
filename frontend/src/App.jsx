import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api, { setToken } from "./api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};
const getToken = () => localStorage.getItem("token");

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setToken(null);
  window.location.href = "/";
}

function Nav() {
  const user = getUser();
  return (
    <header className="nav-wrap">
      <nav className="nav">
        <Link className="brand" to="/">Referral<span>Flow</span></Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {user?.role === "referrer" && <Link to="/referrer">Referrer</Link>}
          {user?.role === "customer" && <Link to="/service">Services</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          {!user && <Link to="/login/referrer">Referrer Login</Link>}
          {!user && <Link to="/login/admin">Admin Login</Link>}
          {!user && <Link to="/register">Customer</Link>}
          {user && <button className="nav-button" onClick={logout}>Logout</button>}
        </div>
      </nav>
    </header>
  );
}

function Page({ children }) { return <main className="page">{children}</main>; }

function Home() {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ref = useMemo(() => new URLSearchParams(location.search).get("ref"), [location.search]);

  useEffect(() => {
    if (!ref) return;
    const key = `tracked-ref-${ref}`;
    if (sessionStorage.getItem(key)) {
      setMessage(`Referral link detected: ${ref}`);
      return;
    }
    api.post("/referrals/track", { referralCode: ref })
      .then(() => { sessionStorage.setItem(key, "1"); setMessage(`Referral link detected: ${ref}`); })
      .catch(() => setError("This referral link is not valid."));
  }, [ref]);

  return (
    <Page>
      <section className="hero">
        <div className="eyebrow">A → B → C • Referral Tracking Demo</div>
        <h1>Turn referrals into<br /><span>measurable revenue.</span></h1>
        <p className="hero-copy">A sees the full journey. B gets a unique referral link. C registers and purchases. The system automatically records the referral and calculates commission.</p>
        {message && <div className="notice success">✓ {message}</div>}
        {error && <div className="notice error">{error}</div>}
        <div className="hero-actions">
          <Link className="primary-btn" to="/login/referrer">Open Referrer Demo</Link>
          <Link className="secondary-btn" to="/login/admin">Open Admin Demo</Link>
        </div>
      </section>

      <section className="flow-section">
        <div className="section-heading"><span>HOW IT WORKS</span><h2>One referral. Complete visibility.</h2></div>
        <div className="flow-grid">
          <FlowCard number="01" title="B shares" text="The referrer gets a unique link such as ?ref=REF001." />
          <FlowCard number="02" title="C registers" text="The customer opens the link and registers with the referral attribution." />
          <FlowCard number="03" title="C purchases" text="A demo service purchase records the amount and commission automatically." />
          <FlowCard number="04" title="A monitors" text="The owner sees clicks, registrations, purchases, revenue and commission." />
        </div>
      </section>

      <section className="demo-note">
        <div><span className="pill">DEMO CONFIG</span><h2>Current commission rate: 10%</h2><p>The rate is configurable from the backend environment, so it can be changed later without redesigning the flow.</p></div>
        <div className="formula"><strong>₹10,000</strong><span>× 10%</span><strong>= ₹1,000</strong><small>Example commission</small></div>
      </section>
    </Page>
  );
}

function FlowCard({ number, title, text }) {
  return <article className="flow-card"><div className="flow-number">{number}</div><h3>{title}</h3><p>{text}</p></article>;
}

function Login({ role }) {
  const nav = useNavigate();
  const defaults = {
    admin: ["admin@example.com", "Admin@123"],
    referrer: ["referrer@example.com", "Referrer@123"],
    customer: ["", ""],
  };
  const [email, setEmail] = useState(defaults[role][0]);
  const [password, setPassword] = useState(defaults[role][1]);
  const [error, setError] = useState("");
  const title = role === "admin" ? "A — Owner Login" : role === "referrer" ? "B — Referrer Login" : "C — Customer Login";

  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.user.role !== role) { setError(`This account is a ${data.user.role} account.`); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      nav(role === "admin" ? "/admin" : role === "referrer" ? "/referrer" : "/service");
    } catch (e) { setError(e.response?.data?.message || "Login failed"); }
  }

  return <Page><div className="auth-shell"><div className="auth-intro"><span className="pill">{role.toUpperCase()} DEMO</span><h1>{title}</h1><p>{role === "admin" ? "Review every referral, customer, purchase and commission from one dashboard." : role === "referrer" ? "Generate and share your referral link and monitor your results." : "Continue to the demo service catalog and make a tracked purchase."}</p></div><form className="form-card" onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="notice error">{error}</div>}<button className="primary-btn" type="submit">Login</button>{role === "customer" && <p className="form-help">Register a customer first if you don't have an account.</p>}</form></div></Page>;
}

function Register() {
  const location = useLocation();
  const nav = useNavigate();
  const ref = new URLSearchParams(location.search).get("ref") || localStorage.getItem("pendingReferralCode") || "";
  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: ref });
  const [error, setError] = useState("");
  useEffect(() => { if (ref) localStorage.setItem("pendingReferralCode", ref); }, [ref]);
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      await api.post("/auth/register", { ...form, role: "customer" });
      localStorage.removeItem("pendingReferralCode");
      nav(`/login/customer?email=${encodeURIComponent(form.email)}`);
    } catch (e) { setError(e.response?.data?.message || "Registration failed"); }
  }
  return <Page><div className="auth-shell"><div className="auth-intro"><span className="pill">CUSTOMER</span><h1>Create C's account</h1><p>Register through B's referral link. The referral code stays attached to the customer for purchase attribution.</p>{ref ? <div className="ref-box">Referral code <strong>{ref}</strong></div> : <div className="notice">No referral code detected. For the client demo, open the referral link from the Referrer dashboard.</div>}</div><form className="form-card" onSubmit={submit}><label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required /></label><label>Referral code<input value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} placeholder="REF001" /></label>{error && <div className="notice error">{error}</div>}<button className="primary-btn" type="submit">Create Customer Account</button></form></div></Page>;
}

function Referrer() {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  const user = getUser();
  useEffect(() => { setToken(getToken()); api.get("/referrals/me").then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || "Please login as the referrer.")); }, []);
  if (user?.role !== "referrer") return <Navigate to="/login/referrer" replace />;
  const link = `${window.location.origin}/?ref=${user.referralCode}`;
  async function copy() { await navigator.clipboard.writeText(link); alert("Referral link copied"); }
  return <Page><div className="dashboard-head"><div><span className="pill">B — REFERRER</span><h1>Your referral dashboard</h1><p>Share this link with a customer and track the journey.</p></div><Link className="secondary-btn" to="/register">Open Customer Registration</Link></div><div className="link-card"><div><small>YOUR UNIQUE REFERRAL LINK</small><input readOnly value={link} /></div><button className="primary-btn" onClick={copy}>Copy Link</button></div>{error && <div className="notice error">{error}</div>}{data && <><Stats items={[["Clicks", data.totals.clicks], ["Registrations", data.totals.registrations], ["Purchases", data.totals.purchases], ["Commission", money(data.totals.commission)]]} /><Activity rows={data.referrals} /></>}</Page>;
}

function Admin() {
  const [data, setData] = useState(null); const [error, setError] = useState(""); const user = getUser();
  useEffect(() => { setToken(getToken()); api.get("/admin/referrals").then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || "Please login as admin.")); }, []);
  if (user?.role !== "admin") return <Navigate to="/login/admin" replace />;
  return <Page><div className="dashboard-head"><div><span className="pill">A — OWNER</span><h1>Referral control center</h1><p>Complete visibility into referral activity and commission.</p></div><div className="admin-badge">10% commission demo</div></div>{error && <div className="notice error">{error}</div>}{data && <><Stats items={[["Clicks", data.summary.clicks], ["Registrations", data.summary.registrations], ["Purchases", data.summary.purchases], ["Revenue", money(data.summary.revenue)], ["Commission", money(data.summary.commission)]]} /><Activity rows={data.referrals} admin /></>}</Page>;
}

function Stats({ items }) { return <div className="stats">{items.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }
function Activity({ rows, admin = false }) { return <section className="activity"><div className="section-heading compact"><span>ACTIVITY</span><h2>{admin ? "All referral activity" : "Your referral activity"}</h2></div>{!rows.length ? <div className="empty">No activity yet. Open the referral link and register a customer to start the demo.</div> : <div className="table-wrap"><table><thead><tr><th>Referrer</th><th>Customer</th><th>Service</th><th>Purchase</th><th>Commission</th><th>Status</th></tr></thead><tbody>{rows.map(x => <tr key={x._id}><td>{x.referrer?.name || "—"}</td><td>{x.customer?.name || "—"}</td><td>{x.service?.name || "—"}</td><td>{money(x.purchaseAmount)}</td><td>{money(x.commissionAmount)}</td><td><span className={`status ${x.status}`}>{x.status}</span></td></tr>)}</tbody></table></div>}</section>; }

function Service() {
  const [services, setServices] = useState([]); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const user = getUser();
  useEffect(() => { api.get("/services").then(r => setServices(r.data.services)); }, []);
  if (user?.role !== "customer") return <Navigate to="/login/customer" replace />;
  async function purchase(id) { setBusy(true); setMessage(""); setToken(getToken()); try { const { data } = await api.post(`/services/${id}/purchase`); setMessage(`✓ Purchase recorded. Commission generated: ${money(data.commission?.amount)} at ${data.commission?.rate || 10}%.`); } catch (e) { setMessage(e.response?.data?.message || "Purchase failed"); } finally { setBusy(false); } }
  return <Page><div className="dashboard-head"><div><span className="pill">C — CUSTOMER</span><h1>Demo services</h1><p>Choose a service to simulate a referral-driven purchase.</p></div></div>{message && <div className="notice success">{message}</div>}<div className="service-grid">{services.map(s => <article className="service-card" key={s._id}><div className="service-icon">₹</div><h2>{s.name}</h2><p>{s.description}</p><div className="service-bottom"><strong>{money(s.price)}</strong><button className="primary-btn" disabled={busy} onClick={() => purchase(s._id)}>{busy ? "Processing…" : "Purchase Demo"}</button></div></article>)}</div></Page>;
}

function App() {
  return <><Nav /><Routes><Route path="/" element={<Home />} /><Route path="/login/admin" element={<Login role="admin" />} /><Route path="/login/referrer" element={<Login role="referrer" />} /><Route path="/login/customer" element={<Login role="customer" />} /><Route path="/register" element={<Register />} /><Route path="/referrer" element={<Referrer />} /><Route path="/admin" element={<Admin />} /><Route path="/service" element={<Service />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></>;
}

export default App;
