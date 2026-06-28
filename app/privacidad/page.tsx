import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "responsable", label: "1. Responsable del tratamiento" },
  { id: "datos", label: "2. Datos que recopilamos" },
  { id: "uso", label: "3. Cómo usamos tus datos" },
  { id: "almacenamiento", label: "4. Almacenamiento y seguridad" },
  { id: "compartir", label: "5. Compartición de datos" },
  { id: "retencion", label: "6. Retención de datos" },
  { id: "derechos", label: "7. Tus derechos" },
  { id: "cookies", label: "8. Cookies y tecnologías similares" },
  { id: "menores", label: "9. Menores de edad" },
  { id: "cambios", label: "10. Cambios a esta política" },
  { id: "contacto", label: "11. Contacto" },
];

export default function PrivacidadPage() {
  return (
    <LegalPageShell
      title="Política de privacidad"
      subtitle="Explicamos de forma clara cómo recopilamos, usamos y protegemos tu información."
      lastUpdated="27 de junio de 2026"
      sections={SECTIONS}
    >
      <LegalSection id="responsable" number={1} title="Responsable del tratamiento">
        <p>
          Cactus Access («nosotros», «nos» o «nuestro») es el responsable del tratamiento de los
          datos personales que se procesan a través de la plataforma Cactus, de conformidad con la
          Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador y demás normativa
          aplicable.
        </p>
        <p>
          El responsable actúa como encargado del tratamiento de los datos de los empleados
          registrados por la empresa cliente, la cual es la responsable principal de dichos datos
          frente a sus trabajadores.
        </p>
      </LegalSection>

      <LegalSection id="datos" number={2} title="Datos que recopilamos">
        <p>Recopilamos las siguientes categorías de datos:</p>
        <ul className="ml-4 flex list-none flex-col gap-3">
          {[
            {
              label: "Datos de la empresa",
              desc: "Nombre, RUC, dirección, correo electrónico y datos del representante legal al momento del registro.",
            },
            {
              label: "Datos de empleados",
              desc: "Nombre, número de cédula, sucursal asignada, horario laboral y salario (si el cliente los ingresa). Cactus no recopila datos biométricos directamente; el dispositivo envía únicamente el identificador del empleado.",
            },
            {
              label: "Registros de asistencia",
              desc: "Fecha, hora de entrada, salida, pausa de almuerzo y métricas derivadas (atrasos, horas extra, salidas tempranas).",
            },
            {
              label: "Datos de uso",
              desc: "Dirección IP, tipo de navegador, páginas visitadas y duración de sesión, para análisis y mejora del servicio.",
            },
            {
              label: "Datos de facturación",
              desc: "Información necesaria para procesar pagos, gestionada por nuestro proveedor de pagos. No almacenamos datos de tarjetas.",
            },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>
                <span className="font-medium text-foreground">{item.label}:</span>{" "}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="uso" number={3} title="Cómo usamos tus datos">
        <p>Utilizamos los datos recopilados para:</p>
        <ul className="ml-4 flex list-none flex-col gap-1.5">
          {[
            "Prestar y mantener el Servicio de control de asistencia.",
            "Generar reportes y estadísticas de asistencia para la empresa.",
            "Gestionar cuentas, suscripciones y facturación.",
            "Enviar comunicaciones sobre el estado del servicio, actualizaciones o soporte.",
            "Mejorar la plataforma mediante análisis de uso agregado y anonimizado.",
            "Cumplir con obligaciones legales aplicables.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          No utilizamos los datos de tus empleados para fines de marketing ni los compartimos con
          terceros con fines comerciales.
        </p>
      </LegalSection>

      <LegalSection id="almacenamiento" number={4} title="Almacenamiento y seguridad">
        <p>
          Los datos son almacenados en servidores seguros proporcionados por Supabase (PostgreSQL),
          con infraestructura alojada en centros de datos certificados. Los datos en tránsito están
          cifrados mediante TLS 1.2 o superior. Los datos en reposo están cifrados mediante AES-256.
        </p>
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger la información
          contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún
          método de transmisión por internet es 100% seguro.
        </p>
        <p>
          El acceso a los datos de producción está restringido al personal autorizado de Cactus y
          se rige por políticas internas de control de acceso.
        </p>
      </LegalSection>

      <LegalSection id="compartir" number={5} title="Compartición de datos">
        <p>
          No vendemos, alquilamos ni compartimos tus datos personales con terceros, excepto en los
          siguientes casos limitados:
        </p>
        <ul className="ml-4 flex list-none flex-col gap-2">
          {[
            {
              label: "Proveedores de servicio",
              desc: "Supabase (base de datos), proveedores de pagos y servicios de correo electrónico, bajo acuerdos de confidencialidad.",
            },
            {
              label: "Requerimientos legales",
              desc: "Cuando sea requerido por ley, orden judicial o autoridad competente.",
            },
            {
              label: "Protección de derechos",
              desc: "Cuando sea necesario para proteger los derechos, propiedad o seguridad de Cactus, sus usuarios u otros.",
            },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>
                <span className="font-medium text-foreground">{item.label}:</span>{" "}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="retencion" number={6} title="Retención de datos">
        <p>
          Conservamos los datos mientras la cuenta esté activa o sea necesario para prestar el
          Servicio. Al cancelar la suscripción, el cliente tiene 30 días para exportar su
          información. Transcurrido este plazo, los datos podrán ser eliminados de forma permanente.
        </p>
        <p>
          Los datos de uso agregados y anonimizados pueden conservarse indefinidamente con fines
          estadísticos. Los registros de facturación se conservan por el período exigido por la
          legislación tributaria ecuatoriana (mínimo 7 años).
        </p>
      </LegalSection>

      <LegalSection id="derechos" number={7} title="Tus derechos">
        <p>
          De conformidad con la LOPDP, el titular de los datos tiene los siguientes derechos:
        </p>
        <ul className="ml-4 flex list-none flex-col gap-2">
          {[
            { label: "Acceso", desc: "Solicitar información sobre los datos que tenemos de usted." },
            { label: "Rectificación", desc: "Corregir datos inexactos o incompletos." },
            { label: "Eliminación", desc: "Solicitar la eliminación de sus datos personales, salvo obligaciones legales." },
            { label: "Portabilidad", desc: "Recibir sus datos en un formato estructurado y de uso común." },
            { label: "Oposición", desc: "Oponerse al tratamiento de sus datos en determinadas circunstancias." },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>
                <span className="font-medium text-foreground">{item.label}:</span>{" "}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
        <p>
          Para ejercer estos derechos, contacta a nuestro equipo de soporte desde la plataforma.
          Responderemos en un plazo máximo de 15 días hábiles.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number={8} title="Cookies y tecnologías similares">
        <p>
          Utilizamos cookies estrictamente necesarias para el funcionamiento de la sesión y la
          autenticación. No utilizamos cookies de rastreo de terceros ni publicidad comportamental.
        </p>
        <p>
          Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar el
          funcionamiento del Servicio, especialmente el inicio de sesión.
        </p>
      </LegalSection>

      <LegalSection id="menores" number={9} title="Menores de edad">
        <p>
          El Servicio está dirigido exclusivamente a empresas y personas mayores de 18 años. No
          recopilamos intencionalmente datos de menores de edad. Si detectamos que hemos recibido
          datos de menores sin consentimiento parental, los eliminaremos de inmediato.
        </p>
      </LegalSection>

      <LegalSection id="cambios" number={10} title="Cambios a esta política">
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Los cambios significativos
          serán notificados por correo electrónico o mediante un aviso visible en la plataforma con
          al menos 15 días de antelación.
        </p>
        <p>
          La fecha de «Última actualización» al inicio de este documento indica cuándo fue revisada
          por última vez. El uso continuado del Servicio tras los cambios constituye la aceptación
          de la política actualizada.
        </p>
      </LegalSection>

      <LegalSection id="contacto" number={11} title="Contacto">
        <p>
          Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de datos
          personales, puedes contactarnos a través del menú de Soporte disponible dentro de la
          aplicación Cactus.
        </p>
        <p>
          También puedes comunicarte con nosotros por WhatsApp a través del botón de soporte en
          la pantalla de inicio de sesión. Nuestro equipo responderá en días hábiles.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
