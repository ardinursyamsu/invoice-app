import Footer from "./footer";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export default function Body(props: any) {
  return (
    <div>
      <Navbar />
      <Sidebar>{props.children}</Sidebar>
      <Footer />
    </div>
  );
}
