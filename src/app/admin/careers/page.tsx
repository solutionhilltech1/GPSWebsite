import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CareersAdmin from "./CareersAdmin";

export const metadata: Metadata = {
  title: "Careers Manager",
  robots: { index: false, follow: false },
};

export default function CareersAdminPage() {
  return (
    <>
      <CareersAdmin />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
