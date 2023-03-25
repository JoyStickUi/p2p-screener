import React from 'react';

import SingleBankTable from './SingleBankTable';
import {Panel} from 'rsuite';

class SpreadsApp extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return (
		    <Panel>
	        	<SingleBankTable/>
	       	</Panel>
		);
	}
}

export default SpreadsApp;
