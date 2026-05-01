"use client";

import { useState } from "react";

type Tab = "terminos" | "privacidad";

interface Props {
  onClose: () => void;
}

export default function TermsModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("terminos");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-campo-dark border border-white/10 rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh]">

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
          <h2 className="font-condensed text-xl font-bold text-white tracking-wide">
            INFORMACIÓN LEGAL
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-sm font-condensed tracking-wide"
          >
            CERRAR ✕
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 mx-5 mt-4 mb-1 bg-campo-card rounded-xl p-1 flex-shrink-0">
          {(["terminos", "privacidad"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-condensed font-bold text-xs tracking-widest uppercase transition-all ${
                tab === t
                  ? "bg-campo-lime text-campo-darker"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {t === "terminos" ? "Términos de uso" : "Privacidad"}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 text-sm text-white/70 space-y-5 leading-relaxed">

          {tab === "terminos" && (
            <>
              <p className="text-white/40 text-xs">Última actualización: mayo 2026</p>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  1. Quiénes somos
                </h3>
                <p>
                  Campo App es un servicio de coaching de running personalizado mediante inteligencia
                  artificial. Al crear una cuenta aceptas estos Términos de Uso en su totalidad.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  2. Edad mínima
                </h3>
                <p>
                  Debes tener al menos <strong className="text-white">16 años</strong> para usar Campo App,
                  conforme al Reglamento General de Protección de Datos (RGPD) y la legislación española
                  vigente. Si eres menor de 16 años, necesitas el consentimiento de tu padre, madre o tutor legal.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  3. Carácter no médico del servicio
                </h3>
                <p>
                  Los planes de entrenamiento generados por Campo App tienen fines informativos y de
                  orientación deportiva general. <strong className="text-white">No constituyen consejo médico,
                  diagnóstico ni tratamiento.</strong> Ante cualquier dolor, lesión o duda sobre tu salud,
                  consulta a un médico o fisioterapeuta antes de iniciar o modificar tu entrenamiento.
                </p>
                <p>
                  Campo App no se responsabiliza de lesiones, daños o perjuicios derivados del seguimiento
                  de los planes de entrenamiento.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  4. Uso aceptable
                </h3>
                <p>Queda prohibido:</p>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  <li>Usar el servicio con fines comerciales sin autorización expresa.</li>
                  <li>Intentar acceder a datos de otros usuarios.</li>
                  <li>Automatizar peticiones al servicio (bots, scripts).</li>
                  <li>Suplantar la identidad de otra persona.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  5. Propiedad intelectual
                </h3>
                <p>
                  El diseño, código y contenidos de Campo App son propiedad de sus desarrolladores. Los
                  planes de entrenamiento generados para ti son de uso personal y no pueden ser revendidos
                  ni redistribuidos.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  6. Modificación y suspensión del servicio
                </h3>
                <p>
                  Nos reservamos el derecho a modificar, suspender o interrumpir el servicio en cualquier
                  momento, con o sin previo aviso. Notificaremos cambios relevantes por email.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  7. Ley aplicable
                </h3>
                <p>
                  Estos términos se rigen por la legislación española. Para cualquier controversia, las
                  partes se someten a los juzgados y tribunales de Bilbao (España).
                </p>
              </section>
            </>
          )}

          {tab === "privacidad" && (
            <>
              <p className="text-white/40 text-xs">Última actualización: mayo 2026 · RGPD (UE) 2016/679 · LOPDGDD 3/2018</p>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  1. Responsable del tratamiento
                </h3>
                <p>
                  <strong className="text-white">Campo App</strong><br />
                  Bilbao, País Vasco, España<br />
                  Contacto: <span className="text-campo-lime">privacidad@campoapp.es</span>
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  2. Datos que recogemos
                </h3>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  <li><strong className="text-white/80">Identificación:</strong> nombre, apellidos, dirección de email.</li>
                  <li><strong className="text-white/80">Datos físicos:</strong> edad, peso, altura (opcionales).</li>
                  <li><strong className="text-white/80">Datos de salud:</strong> lesiones o limitaciones físicas declaradas, nivel de actividad física (categoría especial según RGPD — tratados solo con tu consentimiento explícito).</li>
                  <li><strong className="text-white/80">Objetivos deportivos</strong> y preferencias de entrenamiento.</li>
                  <li><strong className="text-white/80">Historial de uso:</strong> planes generados, sesiones completadas.</li>
                  <li><strong className="text-white/80">Datos técnicos:</strong> dirección IP, navegador (registros de acceso del servidor).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  3. Finalidad y base legal
                </h3>
                <div className="space-y-2 text-white/60">
                  <p><strong className="text-white/80">Prestación del servicio</strong> (base legal: ejecución del contrato) — generar y gestionar tu plan de entrenamiento personalizado.</p>
                  <p><strong className="text-white/80">Datos de salud</strong> (base legal: consentimiento explícito) — procesamos lesiones y nivel de actividad exclusivamente para adaptar el plan. Puedes retirar tu consentimiento en cualquier momento eliminando tu cuenta.</p>
                  <p><strong className="text-white/80">Mejora del servicio</strong> (base legal: interés legítimo) — análisis agregado y anónimo del uso de la aplicación.</p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  4. Terceros que procesan tus datos
                </h3>
                <div className="space-y-3 text-white/60">
                  <div className="bg-campo-card rounded-xl p-3 border border-white/10">
                    <p className="text-white/80 font-medium">Supabase Inc. (EE.UU.)</p>
                    <p className="text-xs mt-1">Base de datos y autenticación. Tus datos se almacenan en servidores de Supabase. Transferencia a EE.UU. amparada en Cláusulas Contractuales Estándar (CCE) aprobadas por la Comisión Europea.</p>
                  </div>
                  <div className="bg-red-900/20 rounded-xl p-3 border border-red-500/20">
                    <p className="text-white/80 font-medium">Groq Inc. (EE.UU.) — IA generativa</p>
                    <p className="text-xs mt-1">
                      <strong className="text-red-400">Importante:</strong> cuando generas un plan o usas el coach, enviamos a Groq tu objetivo, edad, peso y lesiones declaradas para que la IA genere la respuesta. Groq procesa estos datos en sus servidores en EE.UU. conforme a CCE. No vendemos ni cedemos tus datos a Groq para otros fines.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  5. Conservación de los datos
                </h3>
                <p>
                  Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, los datos
                  personales se suprimen en un plazo máximo de 30 días, salvo obligación legal de conservación.
                  Los registros de acceso técnicos se conservan 12 meses.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  6. Tus derechos
                </h3>
                <p>Conforme al RGPD tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  <li><strong className="text-white/80">Acceso</strong> — solicitar copia de tus datos.</li>
                  <li><strong className="text-white/80">Rectificación</strong> — corregir datos inexactos (desde Mi Perfil).</li>
                  <li><strong className="text-white/80">Supresión</strong> — eliminar tu cuenta y datos.</li>
                  <li><strong className="text-white/80">Portabilidad</strong> — recibir tus datos en formato estructurado.</li>
                  <li><strong className="text-white/80">Oposición y limitación</strong> — limitar ciertos tratamientos.</li>
                </ul>
                <p className="mt-2">
                  Escríbenos a <span className="text-campo-lime">privacidad@campoapp.es</span>. Tienes
                  derecho a reclamar ante la{" "}
                  <strong className="text-white">AEPD (Agencia Española de Protección de Datos)</strong>{" "}
                  en <span className="text-campo-lime">aepd.es</span>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-condensed font-bold text-campo-lime tracking-wide uppercase text-sm">
                  7. Cookies
                </h3>
                <p>
                  Usamos únicamente cookies técnicas necesarias para la autenticación (sesión de Supabase).
                  No usamos cookies de seguimiento ni publicidad.
                </p>
              </section>
            </>
          )}
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-campo-lime text-campo-darker font-condensed font-bold text-lg py-3 rounded-xl hover:bg-campo-lime-dark transition-colors tracking-wide"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
}
