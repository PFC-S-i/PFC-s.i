import { Header } from "../header/header";

const Main = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-full min-h-screen w-full overflow-hidden">
      <div className="flex h-screen min-w-full flex-col">
        <Header />
        <div className="flex-grow overflow-y-scroll">
          <div className="flex h-full w-full flex-col items-center gap-4 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Main };
