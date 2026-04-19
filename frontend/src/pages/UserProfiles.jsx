import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

export default function UserProfiles() {
  return (
    <>
      <PageMeta title="Perfil" description="Perfil de usuario" />

      <PageBreadcrumb pageTitle="Perfil" />

      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>

        <p><strong>Nombre:</strong> Usuario</p>
        <p><strong>Email:</strong> usuario@email.com</p>

        <p className="mt-4 text-gray-500">
          (Acá después conectás datos reales del backend)
        </p>
      </div>
    </>
  );
}