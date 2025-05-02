import Footer from "../../components/ui/footer";

export default function AuthLayout({ children }) {
  return (
    // <main className="w-full h-screen bg-[url('/assests/irctc.png')] bg-no-repeat bg-cover bg-right-top scale flex flex-col justify-center items-center">

    <main className="w-full h-screen bg-no-repeat bg-cover bg-right-top flex flex-col justify-center items-center">
    {children}
    <div className="ml-10">
      <Footer />
    </div>
  </main>
  
  );
}
