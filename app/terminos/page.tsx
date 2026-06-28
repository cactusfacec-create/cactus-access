import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "aceptacion", label: "1. Aceptación de los términos" },
  { id: "servicio", label: "2. Descripción del servicio" },
  { id: "cuenta", label: "3. Registro y cuenta" },
  { id: "licencia", label: "4. Licencia de uso" },
  { id: "responsabilidades", label: "5. Responsabilidades del cliente" },
  { id: "pagos", label: "6. Pagos y planes" },
  { id: "disponibilidad", label: "7. Disponibilidad del servicio" },
  { id: "propiedad", label: "8. Propiedad intelectual" },
  { id: "limitacion", label: "9. Limitación de responsabilidad" },
  { id: "modificaciones", label: "10. Modificaciones" },
  { id: "terminacion", label: "11. Terminación" },
  { id: "ley", label: "12. Ley aplicable" },
];

export default function TerminosPage() {
  return (
    <LegalPageShell
      title="Términos de servicio"
      subtitle="Lee cuidadosamente estos términos antes de utilizar la plataforma Cactus."
      lastUpdated="27 de junio de 2026"
      sections={SECTIONS}
    >
      <LegalSection id="aceptacion" number={1} title="Aceptación de los términos">
        <p>
          Al acceder o utilizar la plataforma Cactus («el Servicio»), operada por Cactus Access
          («nosotros», «nos» o «nuestro»), usted acepta quedar vinculado por estos Términos de
          Servicio. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al
          Servicio.
        </p>
        <p>
          El uso continuado de la plataforma después de la publicación de cambios en estos términos
          constituye su aceptación de los mismos.
        </p>
      </LegalSection>

      <LegalSection id="servicio" number={2} title="Descripción del servicio">
        <p>
          Cactus es una plataforma SaaS de control de asistencia inteligente que permite a empresas
          registrar, monitorear y gestionar la asistencia de sus empleados mediante dispositivos
          biométricos vinculados a sucursales.
        </p>
        <p>Las funciones principales incluyen:</p>
        <ul className="ml-4 flex list-none flex-col gap-1.5">
          {[
            "Registro de entradas y salidas en tiempo real.",
            "Panel de asistencias por empleado y sucursal.",
            "Generación de reportes y exportación de datos.",
            "Gestión de justificaciones y calendario laboral.",
            "Configuración de horarios individuales y por sucursal.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
              {item}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="cuenta" number={3} title="Registro y cuenta">
        <p>
          Para utilizar el Servicio, debe registrar una cuenta proporcionando información veraz,
          actualizada y completa. Usted es responsable de mantener la confidencialidad de su
          contraseña y de todas las actividades que ocurran bajo su cuenta.
        </p>
        <p>
          Debe notificarnos inmediatamente cualquier uso no autorizado de su cuenta. Cactus no será
          responsable de pérdidas resultantes del uso no autorizado de su cuenta.
        </p>
        <p>
          Una cuenta representa una empresa. Los datos de empleados y sucursales registrados están
          asociados exclusivamente a esa cuenta y no son accesibles por otras empresas.
        </p>
      </LegalSection>

      <LegalSection id="licencia" number={4} title="Licencia de uso">
        <p>
          Cactus le otorga una licencia limitada, no exclusiva, no transferible y revocable para
          usar el Servicio únicamente para los fines comerciales internos de su empresa, sujeta al
          plan contratado y a estos Términos.
        </p>
        <p>Queda expresamente prohibido:</p>
        <ul className="ml-4 flex list-none flex-col gap-1.5">
          {[
            "Sublicenciar, vender, revender o transferir el acceso al Servicio a terceros.",
            "Modificar, descompilar o realizar ingeniería inversa de la plataforma.",
            "Usar el Servicio para actividades ilegales o contrarias a estos Términos.",
            "Intentar acceder a datos de otras cuentas o al sistema subyacente.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/60" />
              {item}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection id="responsabilidades" number={5} title="Responsabilidades del cliente">
        <p>
          El cliente es responsable de garantizar que el uso del Servicio cumple con la legislación
          laboral ecuatoriana vigente, incluyendo la Ley Orgánica del Trabajo y las normativas del
          Ministerio de Trabajo.
        </p>
        <p>
          El cliente es el único responsable de la exactitud de los datos ingresados (cédulas,
          horarios, sucursales), de la correcta configuración de los dispositivos biométricos y de
          la veracidad de las justificaciones registradas.
        </p>
        <p>
          Cactus actúa como un proveedor tecnológico y no valida ni certifica la veracidad de los
          datos introducidos por el cliente.
        </p>
      </LegalSection>

      <LegalSection id="pagos" number={6} title="Pagos y planes">
        <p>
          El Servicio se ofrece bajo un modelo de suscripción. Los precios, límites de empleados y
          funcionalidades disponibles varían según el plan contratado, descritos en la sección
          «Planes» de la plataforma.
        </p>
        <p>
          El periodo de prueba gratuita de 15 días no requiere método de pago. Al finalizar el
          periodo de prueba, el acceso se suspenderá hasta que contrate un plan.
        </p>
        <p>
          Los pagos son procesados de forma segura. Cactus no almacena datos de tarjetas de
          crédito. El incumplimiento de pago podrá resultar en la suspensión temporal del Servicio.
        </p>
      </LegalSection>

      <LegalSection id="disponibilidad" number={7} title="Disponibilidad del servicio">
        <p>
          Cactus se esfuerza por mantener el Servicio disponible de manera continua, pero no
          garantiza disponibilidad ininterrumpida. Podrán existir períodos de mantenimiento
          programado o interrupciones por causas fuera de nuestro control.
        </p>
        <p>
          Las interrupciones no planificadas serán comunicadas por los canales habituales de soporte
          tan pronto sea posible.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" number={8} title="Propiedad intelectual">
        <p>
          El Servicio, incluyendo su código fuente, diseño, logotipos, marcas y contenido, es
          propiedad exclusiva de Cactus Access y está protegido por la legislación ecuatoriana e
          internacional sobre propiedad intelectual.
        </p>
        <p>
          Los datos que el cliente ingresa a la plataforma (información de empleados, registros de
          asistencia) pertenecen al cliente. Cactus no reivindica ningún derecho de propiedad sobre
          dichos datos.
        </p>
      </LegalSection>

      <LegalSection id="limitacion" number={9} title="Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley, Cactus no será responsable por daños indirectos,
          incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de uso del
          Servicio.
        </p>
        <p>
          La responsabilidad total de Cactus hacia el cliente por cualquier reclamación no excederá
          el importe pagado por el cliente en los tres meses anteriores al evento que dio lugar a la
          reclamación.
        </p>
      </LegalSection>

      <LegalSection id="modificaciones" number={10} title="Modificaciones">
        <p>
          Cactus se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios
          sustanciales serán notificados al cliente por correo electrónico o mediante un aviso
          destacado en la plataforma con al menos 15 días de anticipación.
        </p>
        <p>
          También podremos modificar, añadir o eliminar funcionalidades del Servicio para mejorar
          la experiencia de usuario, manteniendo las funcionalidades esenciales del plan contratado.
        </p>
      </LegalSection>

      <LegalSection id="terminacion" number={11} title="Terminación">
        <p>
          El cliente puede cancelar su suscripción en cualquier momento desde la sección de planes
          de la plataforma. La cancelación surtirá efecto al final del periodo de facturación en
          curso.
        </p>
        <p>
          Cactus puede suspender o terminar el acceso del cliente si incumple estos Términos, con
          notificación previa salvo en casos de actividad fraudulenta o violaciones de seguridad
          graves.
        </p>
        <p>
          Tras la terminación, el cliente puede solicitar la exportación de sus datos durante los
          30 días posteriores. Pasado ese plazo, los datos podrán ser eliminados de forma permanente.
        </p>
      </LegalSection>

      <LegalSection id="ley" number={12} title="Ley aplicable">
        <p>
          Estos Términos se rigen por las leyes de la República del Ecuador. Cualquier disputa que
          surja en relación con estos Términos será sometida a la jurisdicción de los tribunales
          competentes de la ciudad de Quito, Ecuador.
        </p>
        <p>
          Si alguna disposición de estos Términos resulta inválida o inaplicable, las demás
          disposiciones continuarán en plena vigencia.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
