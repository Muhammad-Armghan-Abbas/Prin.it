import ItemList from '../itemList.js';
import Section from '../section.js';
function Home(){
    document.addEventListener('scroll',()=>{
        const head=document.querySelector('header');
        if(window.scrollY>100){
          head.classList.add('scrolled')
        } else {
          head.classList.remove('scrolled')
        }
      })
    return(
      <div>
      <Section></Section>
      <div className="items">
      <ItemList></ItemList>
      </div>
     </div>
    )
}
export default Home;