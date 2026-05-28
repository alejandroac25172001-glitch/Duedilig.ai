import axios from 'axios'

const client = axios.create({ baseURL: '/api/v1' })

export async function analyzeContracts(files) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  const { data } = await client.post('/analysis/upload', form)
  return data
}

export async function exportExcel(resultados) {
  const { data } = await client.post(
    '/analysis/export/excel',
    { resultados },
    { responseType: 'blob' }
  )
  return data
}

export const MOCK_RESULTS = {
  resultados: [
    {
      filename: 'contrato_credito_vivienda_2024.pdf',
      tiene_autorizacion: true,
      menciona_centrales_riesgo: true,
      nivel_riesgo: 'BAJO',
      fragmento_relevante:
        'El DEUDOR autoriza expresamente a BANCOLOMBIA S.A. para reportar, consultar y procesar su información crediticia ante las centrales de información Datacrédito y TransUnión, conforme a la Ley 1266 de 2008 y la Ley 1581 de 2012.',
      resumen:
        'El contrato cumple plenamente con la normativa colombiana de habeas data financiero. La cláusula de autorización es explícita, libre e informada, y menciona las centrales de riesgo por su nombre.',
      confianza: 96,
    },
    {
      filename: 'contrato_arrendamiento_local_comercial.pdf',
      tiene_autorizacion: false,
      menciona_centrales_riesgo: false,
      nivel_riesgo: 'ALTO',
      fragmento_relevante: null,
      resumen:
        'El contrato no contiene ninguna cláusula de autorización de tratamiento de datos personales. Cualquier reporte a centrales de riesgo derivado de este contrato sería ilegal según la Ley 1581 de 2012 y la Ley 1266 de 2008.',
      confianza: 91,
    },
    {
      filename: 'prestamo_personal_fintech_app.pdf',
      tiene_autorizacion: true,
      menciona_centrales_riesgo: false,
      nivel_riesgo: 'MEDIO',
      fragmento_relevante:
        'El cliente autoriza el tratamiento de sus datos personales por parte de FINTECH COLOMBIA S.A.S. para las finalidades descritas en la Política de Privacidad disponible en www.fintech.co.',
      resumen:
        'El contrato tiene una autorización genérica que cumple parcialmente con la Ley 1581, pero no menciona explícitamente el reporte a centrales de riesgo. Un juez podría considerar insuficiente esta autorización para reportes negativos en CIFIN o Datacrédito.',
      confianza: 78,
    },
    {
      filename: 'acuerdo_distribucion_comercial_2023.pdf',
      tiene_autorizacion: true,
      menciona_centrales_riesgo: true,
      nivel_riesgo: 'BAJO',
      fragmento_relevante:
        'Las partes autorizan el reporte de información comercial y crediticia a los operadores de información financiera, incluyendo CIFIN, Datacrédito (Experian), TransUnión Colombia y demás centrales de riesgo autorizadas por la Superintendencia de Industria y Comercio.',
      resumen:
        'El acuerdo comercial incluye una cláusula robusta que menciona explícitamente múltiples centrales de riesgo y la autorización de la SIC. Cumple los estándares de la Ley 1581 y el Decreto 1377 de 2013.',
      confianza: 94,
    },
    {
      filename: 'solicitud_tarjeta_credito_banco.pdf',
      tiene_autorizacion: true,
      menciona_centrales_riesgo: false,
      nivel_riesgo: 'MEDIO',
      fragmento_relevante:
        'Mediante la firma del presente documento, el titular autoriza a la entidad a tratar sus datos personales de conformidad con la política de privacidad vigente y la normativa aplicable sobre protección de datos.',
      resumen:
        'El formulario incluye una autorización genérica pero no especifica el reporte a centrales crediticias. La ausencia de una mención explícita a Datacrédito o CIFIN debilita la base legal para reportes negativos.',
      confianza: 68,
    },
  ],
  resumen_global: {
    total: 5,
    alto: 1,
    medio: 2,
    bajo: 2,
    errores: 0,
    porcentaje_cumplimiento: 40.0,
  },
}
