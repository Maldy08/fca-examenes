// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando sembrado de datos...")

  // 1. Crear al Profesor (ADMIN)
  const professor = await prisma.user.upsert({
    where: { email: 'profe@uabc.edu.mx' },
    update: {},
    create: {
      email: 'profe@uabc.edu.mx',
      name: 'Profe CMALDONADO',
      role: 'ADMIN',
    },
  })

  console.log(`✅ Usuario creado: ${professor.name}`)

  // 2. Crear el Examen de Bases de Datos
  const exam = await prisma.exam.create({
    data: {
      title: 'Parcial 1: Fundamentos de SQL',
      description: 'Evaluación práctica de consultas y teoría básica.',
      accessCode: 'DB2025', 
      createdById: professor.id,
      isActive: true,
      questions: {
        create: [
          {
            content: '¿Qué comando SQL se utiliza para eliminar una tabla completa?',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            options: {
              create: [
                { text: 'DELETE TABLE', isCorrect: false },
                { text: 'DROP TABLE', isCorrect: true },
                { text: 'REMOVE TABLE', isCorrect: false },
              ],
            },
          },
          {
            content: 'Escribe una consulta para obtener todos los empleados con salario > 5000.',
            type: 'CODE_SQL',
            points: 20,
          },
          {
            content: 'Explica la diferencia entre Primary Key y Foreign Key.',
            type: 'OPEN_TEXT',
            points: 15,
          },
        ],
      },
    },
  })

  console.log(`✅ Examen creado: ${exam.title}`)

  // 3. Crear un ESTUDIANTE de prueba y un INTENTO (Para que puedas entrar YA)
  const student = await prisma.user.upsert({
    where: { email: 'alumno@uabc.edu.mx' },
    update: {},
    create: {
      email: 'alumno@uabc.edu.mx',
      name: 'Alumno Prueba',
      role: 'STUDENT',
    },
  })

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: student.id,
      examId: exam.id,
      startedAt: new Date(),
    }
  })

  console.log("\n---------------------------------------------------")
  console.log("🚀 ¡TODO LISTO! Entra a esta URL para probar tu examen:")
  console.log(`http://localhost:3000/take-exam/${attempt.id}`)
  console.log("---------------------------------------------------\n")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })