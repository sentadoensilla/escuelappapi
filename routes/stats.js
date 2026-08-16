const express = require('express');
const router = express.Router();
const Controller = require('../controllers/TotalController');
const Auth = require('../middlware/jwtoken');
const {upload} = require('../middlware/uploadImages');

// ADMIN SCHOOLS
router.post('/statsinitial/attendancesteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalTeacherAttendance);
router.post('/statsinitial/attendancesteacherbyday',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalTeacherAttendanceDay);
router.post('/statsinitial/attendancesstudent',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalStudentsAttendance);
router.post('/statsinitial/attendancesstudentday',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalStudentsAttendanceByDay);
router.post('/statsinitial/listUnnattendance',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.totalAttendance);
router.post('/statsinitial/listUnnattendanceGroup',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.totalAttendanceGroup);
router.post('/statsinitial/examsstudent',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalStudentsExams);
router.post('/statsinitial/homeworksstudent',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalStudentsHomeWorks);
router.post('/statsinitial/askteacher',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalTeacherAsk);
router.post('/statsinitial/askteacherDetail',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalTeacherAskDetails);
router.post('/statsinitial/alertsent',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalAlerts);
router.post('/statsinitial/studentsResume',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalListStudents);
router.post('/statsinitial/totalbitacora',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.totalBitacora);
router.post('/statsinitial/statusWP',upload.none(),[Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion],Controller.resumeWhatsapp);

// TEACHERS 
router.post('/statsinitial/alertsentteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalAlertsXTeacher);
router.post('/statsinitial/teacheraskteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalTeacherAskXTeacher);
router.post('/statsinitial/teacheraskteacherDetail',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalTeacherAskDetailsXTeacher);
router.post('/statsinitial/excusesteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalExcusesTeacher);
router.post('/statsinitial/studentsResumeteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalListStudentsXTeacher);
router.post('/statsinitial/attendancesstudentteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalStudentsAttendanceXTeacher);
router.post('/statsinitial/totalbitacorateacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalBitacoraXTeacher);
router.post('/statsinitial/attendancesstudentdayteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalStudentsAttendanceByDayXTeacher);
router.post('/statsinitial/listUnnattendanceGroupteacher',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.totalAttendanceGroupXTeacher);
router.post('/statsinitial/listUnnattendanceteacher',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.totalAttendanceXTeacher);
router.post('/statsinitial/examsstudentteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalStudentsExamsXTeacher);
router.post('/statsinitial/homeworksstudentteacher',upload.none(),[Auth.isAuth, Auth.isDirector_and_tecaher],Controller.totalStudentsHomeWorksXTeacher);

// STUDENTS

module.exports = router 