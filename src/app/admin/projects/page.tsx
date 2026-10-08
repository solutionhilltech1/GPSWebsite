import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProjectsAdmin from "./ProjectsAdmin";

export const metadata: Metadata = {
  title: "Projects Manager",
  robots: { index: false, follow: false },
};

export default function ProjectsAdminPage() {
  return (
    <>
      <ProjectsAdmin />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
