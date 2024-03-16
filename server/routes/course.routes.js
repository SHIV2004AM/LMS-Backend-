import { Router } from "express";
import { addLecturesToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { isLoggedIn , authorizedRoles, authorizeSubscriber} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router() ; 

router.get('/'  , getAllCourses) ; 

router.get('/:id' ,authorizeSubscriber,  isLoggedIn , getLecturesByCourseId) ;

router.post('/' ,isLoggedIn ,authorizedRoles('ADMIN') , upload.single('thumbnail') ,  createCourse)



router.put('/:id' , isLoggedIn ,authorizedRoles('ADMIN'), updateCourse)


router.delete('/:id' ,isLoggedIn  ,authorizedRoles('ADMIN'), removeCourse)

router.post('/:id' , isLoggedIn , authorizedRoles('ADMIN') , upload.single('thumbnail') , addLecturesToCourseById)
export default router ; 