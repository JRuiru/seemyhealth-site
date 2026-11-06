import { useState, useEffect, type ReactNode } from "react";
import {
  getCustomer,
  loginReturningTo,
  logout,
  connectShopAccount,
  type Customer,
  type ShopConnectResult,
} from "../../lib/shopify/auth-client";

// /account/connect?t=<token>: the app's "connect your shop account" link.
// Signs the visitor in to the store (and back here), asks them to confirm the store account they
// are signed in as, then has the BFF connect it. The BFF takes the customer from the session; the
// page only ever sends the token from its link.

type Phase =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "signin_failed" }
  | { kind: "confirm"; connecting: boolean }
  | { kind: "outcome"; result: ShopConnectResult; retrying: boolean };

const LOGIN_ATTEMPT_KEY = "smh_connect_login_attempt";
const ICON_CHECK = "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_WARNING = "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z";
const ICON_LINK = "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244";
const ICON_CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";

function readToken(): string | null {
  const t = new URLSearchParams(window.location.search).get("t");
  return t && t.trim() ? t.trim() : null;
}

function returnPath(token: string): string {
  return `/account/connect?${new URLSearchParams({ t: token })}`;
}

// Once the answer is final the link has done its job, so it leaves the address bar (and history).
function dropTokenFromAddress() {
  window.history.replaceState({}, "", "/account/connect");
}

// A store account made moments ago can take a few tries to show up on the Customer Account API,
// as on the account page.
async function getCustomerWithRetry(attempts = 3, delayMs = 900): Promise<Customer | null> {
  for (let i = 0; i < attempts; i++) {
    const customer = await getCustomer();
    if (customer) return customer;
    if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

function recentlySentToLogin(): boolean {
  try {
    const last = sessionStorage.getItem(LOGIN_ATTEMPT_KEY);
    return !!last && Date.now() - parseInt(last) < 30000;
  } catch {
    return false;
  }
}

function sendToLogin(token: string) {
  try {
    sessionStorage.setItem(LOGIN_ATTEMPT_KEY, Date.now().toString());
  } catch {
    // Private mode: the loop guard is a nicety, the sign-in still works.
  }
  loginReturningTo(returnPath(token));
}

function forgetLoginAttempt() {
  try {
    sessionStorage.removeItem(LOGIN_ATTEMPT_KEY);
  } catch {
    // Nothing to forget.
  }
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const quietLink =
  "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[1.5px] text-brand-gray-500 hover:text-white transition-colors";

function Card({
  icon,
  tone = "neutral",
  title,
  children,
  actions,
}: {
  icon: string;
  tone?: "neutral" | "success";
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6 rounded-2xl bg-brand-gray-900 border border-white/5 max-w-lg mx-auto">
      <svg
        className={`w-12 h-12 mx-auto mb-4 ${tone === "success" ? "text-emerald-500" : "text-brand-gray-600"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-500 mb-3">Shop Account</p>
      <h1 className="text-lg font-medium text-white mb-2">{title}</h1>
      <div className="text-sm text-brand-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">{children}</div>
      {actions && <div className="flex flex-col items-center gap-4">{actions}</div>}
    </div>
  );
}

function Email({ value }: { value: string }) {
  return <span className="text-white break-all">{value}</span>;
}

const freshLinkHint = (
  <>
    Open the SeeMyHealth app and go to <span className="text-brand-gray-300">Account › Shop account</span> for a fresh one.
  </>
);

const toAccount = (
  <a href="/account" className={primaryButton}>
    Go to My Account
  </a>
);

const needAHand = (
  <a href="/support" className={quietLink}>
    Need a hand?
  </a>
);

export default function ShopConnect() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  useEffect(() => {
    const t = readToken();
    if (!t) {
      setPhase({ kind: "missing" });
      return;
    }
    setToken(t);

    const cameBackFromLogin = recentlySentToLogin();
    (cameBackFromLogin ? getCustomerWithRetry() : getCustomer()).then((customer) => {
      if (!customer) {
        if (cameBackFromLogin) {
          setPhase({ kind: "signin_failed" });
          return;
        }
        sendToLogin(t);
        return;
      }
      forgetLoginAttempt();
      setEmail(customer.emailAddress?.emailAddress || null);
      setPhase({ kind: "confirm", connecting: false });
    });
  }, []);

  async function connect() {
    if (!token) return;
    if (phase.kind === "confirm") {
      if (phase.connecting) return;
      setPhase({ kind: "confirm", connecting: true });
    } else if (phase.kind === "outcome" && phase.result.status === "failed") {
      if (phase.retrying) return;
      setPhase({ ...phase, retrying: true });
    } else {
      return;
    }

    const result = await connectShopAccount(token);
    if (result.status === "signed_out") {
      // The session ended between the check and the tap: sign in again and come straight back.
      if (recentlySentToLogin()) {
        setPhase({ kind: "signin_failed" });
      } else {
        sendToLogin(token);
      }
      return;
    }
    if (result.status !== "failed") dropTokenFromAddress();
    setPhase({ kind: "outcome", result, retrying: false });
  }

  if (phase.kind === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (phase.kind === "missing") {
    return (
      <Card icon={ICON_WARNING} title="This link isn't complete">
        <p>It looks like part of the link went missing on the way. {freshLinkHint}</p>
      </Card>
    );
  }

  if (phase.kind === "signin_failed") {
    return (
      <Card
        icon={ICON_WARNING}
        title="Something went wrong"
        actions={
          <button
            onClick={() => {
              forgetLoginAttempt();
              if (token) sendToLogin(token);
            }}
            className={primaryButton}
          >
            Try Again
          </button>
        }
      >
        <p>We couldn't sign you in this time. Let's try that again.</p>
      </Card>
    );
  }

  if (phase.kind === "confirm") {
    return (
      <Card
        icon={ICON_LINK}
        title="Connect your shop account"
        actions={
          <>
            <button onClick={connect} disabled={phase.connecting} className={primaryButton}>
              {phase.connecting && (
                <span className="w-3.5 h-3.5 border-2 border-brand-black/20 border-t-brand-black rounded-full animate-spin" />
              )}
              {phase.connecting ? "Connecting" : "Connect"}
            </button>
            <button onClick={logout} className={quietLink}>
              Not you? Sign out
            </button>
          </>
        }
      >
        <p>
          {email ? (
            <>You're signed in to the shop as <Email value={email} />. </>
          ) : (
            <>You're signed in to the shop. </>
          )}
          Connect it to your SeeMyHealth app and the two will know each other from now on.
        </p>
      </Card>
    );
  }

  const { result } = phase;

  switch (result.status) {
    case "linked":
      return (
        <Card icon={ICON_CHECK} tone="success" title="You're connected" actions={toAccount}>
          <p>
            {result.email ? (
              <>Your shop account <Email value={result.email} /> and your SeeMyHealth app are now connected.</>
            ) : (
              <>Your shop account and your SeeMyHealth app are now connected.</>
            )}{" "}
            Nothing more to do.
          </p>
        </Card>
      );

    case "already_linked":
      return (
        <Card icon={ICON_CHECK} tone="success" title="Already connected" actions={toAccount}>
          <p>
            Good news,{" "}
            {result.email ? <Email value={result.email} /> : "this shop account"} was already connected to
            your SeeMyHealth app. You're all set.
          </p>
        </Card>
      );

    case "customer_linked_elsewhere":
      return (
        <Card icon={ICON_WARNING} title="Connected to another app account" actions={needAHand}>
          <p>
            This shop account already belongs to a different SeeMyHealth app account. If that doesn't sound
            right, get in touch and we'll sort it out together.
          </p>
        </Card>
      );

    case "identity_linked_elsewhere":
      return (
        <Card icon={ICON_WARNING} title="Your app is connected elsewhere" actions={needAHand}>
          <p>
            Your SeeMyHealth app account is already connected to a different shop account. If that doesn't
            sound right, get in touch and we'll sort it out together.
          </p>
        </Card>
      );

    case "expired":
      return (
        <Card icon={ICON_CLOCK} title="This link has expired">
          <p>Connect links work once and last seven days. {freshLinkHint}</p>
        </Card>
      );

    default:
      return (
        <Card
          icon={ICON_WARNING}
          title="Something went wrong"
          actions={
            <button onClick={connect} disabled={phase.retrying} className={primaryButton}>
              {phase.retrying && (
                <span className="w-3.5 h-3.5 border-2 border-brand-black/20 border-t-brand-black rounded-full animate-spin" />
              )}
              {phase.retrying ? "Trying Again" : "Try Again"}
            </button>
          }
        >
          <p>We couldn't connect your accounts this time. Let's try that again.</p>
        </Card>
      );
  }
}
