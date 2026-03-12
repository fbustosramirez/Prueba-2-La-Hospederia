
/**
 * SERVICIO DE CONFIGURACIÓN DE CORREO REAL
 * ---------------------------------------
 */

const EMAILJS_PUBLIC_KEY: string = "UI3p0CHbbJhGUsr8V"; 
const EMAILJS_SERVICE_ID: string = "service_1jmynfq"; 
const EMAILJS_TEMPLATE_ID: string = "template_pz2knum"; 

/**
 * Envía un código de seguridad al correo del usuario.
 * Mantenemos el nombre 'user_password' en el envío para no romper tu plantilla actual de EmailJS,
 * pero ahora el contenido será un PIN de seguridad.
 */
export const sendRecoveryEmail = async (email: string, userName: string, securityCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    // @ts-ignore
    const emailjs = window.emailjs;
    
    if (EMAILJS_PUBLIC_KEY === "TU_PUBLIC_KEY_AQUI" || !EMAILJS_PUBLIC_KEY) {
      return { 
        success: true, 
        message: '(Modo Simulación) Código enviado: ' + securityCode 
      };
    }

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_name: userName,
      user_email: email,
      // Usamos el mismo nombre que ya configuraste en tu plantilla de EmailJS
      user_password: securityCode, 
      app_name: "Santa Francisca Romana"
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      return { 
        success: true, 
        message: 'Código de seguridad despachado a ' + email 
      };
    } else {
      return { success: false, message: `Error ${response.status} de EmailJS.` };
    }
  } catch (error: any) {
    console.error('Error de EmailJS:', error);
    return { success: false, message: 'Error de comunicación con el servidor de correos.' };
  }
};
