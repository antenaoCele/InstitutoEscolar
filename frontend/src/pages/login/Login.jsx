import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function Login() {
  return (
    <>
      <PageMeta title="Login" description="Inicio de sesión" />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
