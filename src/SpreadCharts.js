import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Panel} from 'rsuite';

class SpreadCharts extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            spreadData: []
        };
    }

    componentDidMount(){
        fetch('/spreads').then((res)=>res.json()).then((json)=>{
		 this.setState({
            spreadData: json
		 });
		}).catch(err=>console.log(err));
    }

    render(){
        return (
            <Panel>
                <ResponsiveContainer width="100%" height={420}>
                    <LineChart
                    width={500}
                    height={300}
                    data={this.state.spreadData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />                
                    <Line type="monotone" dataKey="spread" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="gmi" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </Panel>
        );
    }
}

export default SpreadCharts;