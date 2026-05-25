import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Creating classrooms for all grades and enrolling all students...\n')

    const teacher = await prisma.teacher.findFirst()
    const school = await prisma.school.findFirst()

    if (!teacher || !school) {
        console.log('❌ No teacher or school found. Run seed first.')
        return
    }

    const chapters = await prisma.chapter.findMany({
        orderBy: [{ grade: 'asc' }, { order: 'asc' }],
    })

    for (const grade of ['X', 'XI', 'XII'] as const) {
        let classroom = await prisma.classroom.findFirst({ where: { grade } })

        if (!classroom) {
            classroom = await prisma.classroom.create({
                data: {
                    name: `Matematika Kelas ${grade}`,
                    description: `Kelas matematika untuk semua siswa kelas ${grade}`,
                    grade,
                    joinCode: `MATH${grade}${Date.now().toString(36).slice(-4).toUpperCase()}`,
                    teacherId: teacher.id,
                    schoolId: school.id,
                    academicYear: '2025/2026',
                    semester: 2,
                },
            })
            console.log(`✅ Created classroom: ${classroom.name} (join: ${classroom.joinCode})`)
        } else {
            console.log(`ℹ️  Classroom exists: ${classroom.name}`)
        }

        const gradeChapters = chapters.filter(ch => ch.grade === grade)
        const existingAssignments = await prisma.classroomChapter.findMany({
            where: { classroomId: classroom.id },
        })
        const assignedIds = new Set(existingAssignments.map(a => a.chapterId))

        let addedCount = 0
        for (let i = 0; i < gradeChapters.length; i++) {
            if (!assignedIds.has(gradeChapters[i].id)) {
                await prisma.classroomChapter.create({
                    data: {
                        classroomId: classroom.id,
                        chapterId: gradeChapters[i].id,
                        order: existingAssignments.length + addedCount + 1,
                    },
                })
                addedCount++
            }
        }
        const totalAssigned = existingAssignments.length + addedCount
        console.log(`   📚 ${totalAssigned} chapters assigned (${addedCount} new)`)

        const students = await prisma.student.findMany({ where: { grade } })
        for (const student of students) {
            const existing = await prisma.classroomEnrollment.findUnique({
                where: { classroomId_studentId: { classroomId: classroom.id, studentId: student.id } },
            })
            if (!existing) {
                await prisma.classroomEnrollment.create({
                    data: { classroomId: classroom.id, studentId: student.id },
                })
                console.log(`   👨‍🎓 Enrolled student ${student.id}`)
            }
        }
    }

    const unenrolledStudents = await prisma.student.findMany({
        where: { enrollments: { none: {} } },
        include: { user: { select: { name: true, email: true } } },
    })

    if (unenrolledStudents.length > 0) {
        console.log(`\n⚠️  Found ${unenrolledStudents.length} unenrolled students`)

        for (const student of unenrolledStudents) {
            let classroom = await prisma.classroom.findFirst({ where: { grade: student.grade } })
            if (!classroom) {
                classroom = await prisma.classroom.findFirst()
            }

            if (classroom) {
                await prisma.classroomEnrollment.create({
                    data: { classroomId: classroom.id, studentId: student.id },
                })
                console.log(`   ✅ Enrolled "${student.user.name}" (${student.user.email}) → ${classroom.name}`)
            }
        }
    }

    console.log('\n\n📊 FINAL VERIFICATION:')

    const allClassrooms = await prisma.classroom.findMany({
        include: {
            _count: { select: { enrollments: true, chapters: true } },
        },
    })
    for (const cls of allClassrooms) {
        console.log(`\n🏫 ${cls.name} (${cls.grade}):`)
        console.log(`   Join Code: ${cls.joinCode}`)
        console.log(`   Chapters: ${cls._count.chapters}`)
        console.log(`   Students: ${cls._count.enrollments}`)
    }

    const allStudents = await prisma.student.findMany({
        include: {
            user: { select: { name: true, email: true } },
            enrollments: {
                include: {
                    classroom: {
                        include: { _count: { select: { chapters: true } } },
                    },
                },
            },
        },
    })
    console.log('\n')
    for (const s of allStudents) {
        console.log(`👨‍🎓 ${s.user.name} (${s.user.email}) - Grade: ${s.grade}`)
        for (const e of s.enrollments) {
            console.log(`   → ${e.classroom.name}: ${e.classroom._count.chapters} chapters available`)
        }
    }

    console.log('\n✅ Done! All students can now access all materials and quizzes.')
}

main()
    .catch(console.error)
    .finally(() => prisma['$disconnect']())
