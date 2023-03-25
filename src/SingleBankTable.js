import React from 'react';
import {Table, Stack, Divider, SelectPicker} from 'rsuite';

import {BANKS, TICKERS} from './config';

const { Column, HeaderCell, Cell } = Table;

const select_picker_list = BANKS.map(item => ({label: item, value: item}));

class SingleBankTable extends React.Component{
	constructor(props){
		super(props);
		this.state={
			bank: BANKS[0],
			orders: []
		};
	}

	componentDidMount(){
		this.reloadTable();
	}

	reloadTable(bank = BANKS[0]){
		if(!bank)bank=BANKS[0];
		this.setState({
			orders: []
		});
		let banks = [bank];
		for(let ticker of TICKERS){
		fetch('/spreads',{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				buyTicker: ticker,
				sellTicker: ticker,
				buyBanks: banks,
				sellBanks: banks,
				site: 'binance'
			})
		}).then((res)=>res.json()).then((json)=>{
		 const data = this.state.orders;
 
		 data.push({
			  ticker: json["ticker"],
			  buyBank: bank,
			  sellBank: bank,
			  spread: json["spread"],
			  gmi: json["gmi"]
		 });
		 this.setState({
			 orders: data
		 });
		}).catch(err=>console.log(err));
		}
	}

	render(){
		const {orders} = this.state;
		return (
			<Stack style={{width: '100%'}}  justifyContent='center' direction="column" spacing={20} alignItems="stretch">
			 <SelectPicker data={select_picker_list} onChange={(value,e)=>this.reloadTable(value)}/>	 
			<Table
      height={420}
      data={orders}
      bordered
      cellBordered
    >
       <Column flexGrow={1}>
        <HeaderCell>Ticker</HeaderCell>
        <Cell dataKey="ticker" />
       </Column>

       <Column flexGrow={2}>
        <HeaderCell>Taker</HeaderCell>
        <Cell dataKey="buyBank" />
       </Column>

       <Column flexGrow={2}>
        <HeaderCell>
          Maker
        </HeaderCell>
        <Cell dataKey="sellBank" />
       </Column>

       <Column flexGrow={3}>
        <HeaderCell>
          Spread
        </HeaderCell>
        <Cell>{rowData=>(<span>{rowData.spread}% </span>)}</Cell>
       </Column>
	
       <Column flexGrow={3}>
        <HeaderCell>
          Greedy Merchant index
        </HeaderCell>
        <Cell>{rowData=>(<span>{rowData.gmi}% </span>)}</Cell>
       </Column>
      </Table>
      </Stack>
		);
	}
}

export default SingleBankTable;
