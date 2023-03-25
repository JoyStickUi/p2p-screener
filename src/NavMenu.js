import React from 'react';

import {Navbar, Nav} from 'rsuite';
import {Link} from 'react-router-dom';

class NavMenu extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return (
		  <Navbar>
	      	   <Navbar.Brand href="/">P2P Screener</Navbar.Brand>
	       	   <Nav>
	            <Nav.Item eventKey="binance">
		     <Link to="/binance">Binance</Link>
		    </Nav.Item>
	       	   </Nav>
	     	  </Navbar>		
		);
	}
}

export default NavMenu;
