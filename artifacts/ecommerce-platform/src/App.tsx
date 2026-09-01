import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Shop from '@/pages/shop';
import ProductPage from '@/pages/product';
import Cart from '@/pages/cart';
import Checkout from '@/pages/checkout';
import OrderSuccess from '@/pages/order-success';
import About from '@/pages/about';
import Contact from '@/pages/contact';
import CustomOrder from '@/pages/custom-order';
import Admin from '@/pages/admin';
import { StoreShell } from '@/components/store-shell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#4a0e0e',
    colorForeground: '#1a1712',
    colorMutedForeground: '#6f665d',
    colorDanger: '#963e39',
    colorBackground: '#f9f7f2',
    colorInput: '#fffdf8',
    colorInputForeground: '#1a1712',
    colorNeutral: '#d9d2c5',
    fontFamily: '"Iogen Sans", "Avenir Next", Arial, sans-serif',
    borderRadius: '0px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#f9f7f2] rounded-none w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: '!text-[#1a1712]',
    headerSubtitle: '!text-[#6f665d]',
    socialButtonsBlockButtonText: '!text-[#1a1712]',
    formFieldLabel: '!text-[#1a1712]',
    footerActionLink: '!text-[#4a0e0e]',
    footerActionText: '!text-[#6f665d]',
    dividerText: '!text-[#6f665d]',
    identityPreviewEditButton: '!text-[#4a0e0e]',
    formFieldSuccessText: '!text-[#3d7548]',
    alertText: '!text-[#963e39]',
    logoBox: 'mb-4',
    logoImage: 'max-h-12',
    socialButtonsBlockButton: '!border-[#d9d2c5] !bg-[#fffdf8]',
    formButtonPrimary: '!bg-[#4a0e0e] !text-[#f9f7f2] hover:!bg-[#310b0c]',
    formFieldInput: '!border-[#d9d2c5] !bg-[#fffdf8] !text-[#1a1712]',
    footerAction: '!bg-transparent',
    dividerLine: '!bg-[#d9d2c5]',
    alert: '!border-[#e7c8c4] !bg-[#fbefed]',
    otpCodeFieldInput: '!border-[#d9d2c5] !bg-[#fffdf8]',
    formFieldRow: 'mb-4',
    main: 'px-2',
  },
};

function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      if (user) queryClient.clear();
    });
    return unsubscribe;
  }, [addListener]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to manage iLonito.' } },
        signUp: { start: { title: 'Join iLonito', subtitle: 'Create your atelier account.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/admin" component={Admin} />
        <Route>
          <StoreShell>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/shop" component={Shop} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/custom-order" component={CustomOrder} />
              <Route path="/product/:id" component={ProductPage} />
              <Route path="/cart" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/order-success/:id" component={OrderSuccess} />
              <Route component={NotFound} />
            </Switch>
          </StoreShell>
        </Route>
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
