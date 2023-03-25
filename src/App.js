import React from "react";
import './App.css';
import SpreadsApp from './SpreadsApp';

import "rsuite/dist/rsuite.min.css";

import {Container, Header, Content, Footer} from 'rsuite';
import {Outlet} from 'react-router-dom';
import NavMenu from './NavMenu';

class App extends React.Component{

	constructor(props){
	 super(props);
	}	

	render(){	
	 return (
		 <Container>
		  <Header>
		   <NavMenu/>
		  </Header>
		  <Content>
		   <Outlet/>
		  </Content>
		  <Footer>
	 	  </Footer>
		 </Container>

         );
	}

}

export default App;
