
import UseFetch from '../hooks/UseFetch'
import '../App.css'
import Loading from '../components/Loading';
import ProjectBoardAdmin from '../components/admin/ProjectBoardAdmin';
import ProjectBoardWorker from '../components/worker/ProjectBoardWorker';

function ProjectBoard() {

  const userData = UseFetch()

  if(!userData || !userData.role){

    return <Loading message='Loading Your Projects...'/>
  }
   if(userData.role === 'manager'){
  
      return <ProjectBoardAdmin/>
    }
    if(userData.role === 'worker') {
  
      return <ProjectBoardWorker/>
    }
}

export default ProjectBoard