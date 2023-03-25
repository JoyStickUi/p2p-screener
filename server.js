const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express(); 
const port = process.env.PORT || 5000;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use(bodyParser.json());

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/spreads', (req, res)=>{
	db.serialize(function(){
		db.all('SELECT rowid AS id, spread, gmi FROM spread_change', function(err, row){
			res.send(row);			
		});
	});		
});

app.post('/spreads', (req, res) => {
	if(req.body.site == 'binance'){
		getBinanceSpreads(req, res);
	}
	if(req.body.site == 'bybit'){
		getBybitSpreads(req, res);
	}
  });

  db.serialize(function(){
	db.run('CREATE TABLE spread_change (id INTEGER PRIMARY KEY AUTOINCREMENT, spread FLOAT(2), gmi FLOAT(2), created_at TIMESTAMP DEFAULT NOW())',(err)=>{});
	// db.run('INSERT INTO spread_change (spread, gmi) VALUES (?, ?)',
	// 	[1.1, 0.1]
	// );
	// db.run('INSERT INTO spread_change (spread, gmi) VALUES (?, ?)',
	// 	[2.0, 0.5]
	// );
	// db.run('INSERT INTO spread_change (spread, gmi) VALUES (?, ?)',
	// 	[1.5, 0.2]
	// );
  });


  function getBybitSpreads(req, res){
	let url = 'https://api2.bybit.com/spot/api/otc/item/list';
	let buyBody =
	{
        	'proMerchantAds': false,
        	'page': 1,
        	'rows': 10,
        	'payTypes': req.body.buyBanks,
        	'countries': [],
        	'publisherType': null,
        	'asset': req.body.buyTicker,
        	'fiat': 'RUB',
        	'tradeType': 'SELL',
			'transAmount': '3000'
    	};
	let sellBody =
	{
        	'proMerchantAds': false,
        	'page': 1,
        	'rows': 1,
        	'payTypes': req.body.sellBanks,
        	'countries': [],
        	'publisherType': null,
        	'asset': req.body.sellTicker,
        	'fiat': 'RUB',
        	'tradeType': 'BUY',
			'transAmount': '5000'
    	};
	let headers = {
		"credentials": "include",
		"referrer": "https://www.bybit.com/",
  		"referrerPolicy": "strict-origin-when-cross-origin",
		"accept": "application/json",
		"accept-language": "ru-RU",
		"content-type": "application/x-www-form-urlencoded",
		"guid": "eb8b9cca-7823-7106-2a2a-c699403d87f5",
		"lang": "ru-RU",
		"platform": "PC",
		"sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-site",
		"usertoken": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjIxMDc2NTEsInVzZXJfaWQiOjI4MTMyNTMsImdlbl90cyI6MTY2MTg0ODQ1MX0.cVhiVd65EBr0ZBP8A0Z04FtMhgWeidrfIEvLdyi_4NF8s-z8iqXhhiJgyxOVRihEeCogx7BLocA9KUWyG-9HfA"
        };

	Promise.all([
		axios.post(url, buyBody,
    		{
        		headers: headers
		}
		),
		axios.post(url, sellBody,
    		{
        		headers: headers
		}
		)
	]).then(values =>{		
		let idx = 0;
		let prevBuyPrice = values[0]["data"]["data"][idx]["adv"]["price"];
		while(values[0]["data"]["data"][idx]["advertiser"]["userIdentity"] != "" && idx < 9){
			prevBuyPrice = values[0]["data"]["data"][idx]["adv"]["price"]
			++idx;
		}
		let buyPrice = values[0]["data"]["data"][0]["adv"]["price"];
		let sellPrice = values[1]["data"]["data"][0]["adv"]["price"];
		let spread = ((sellPrice - buyPrice)*100)/buyPrice;
		let gmi = ((buyPrice - prevBuyPrice)*100)/prevBuyPrice;// gay merchant index
		spread -= 0.2;
		res.send({
			spread: spread.toFixed(2),
			gmi: gmi.toFixed(2),
			ticker: values[0]["data"]["data"][0]["adv"]["asset"]
		});
	}).catch(err=>console.log(err));
  }

  function getBinanceSpreads(req, res){
	let url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
	let buyBody =
	{
        	'proMerchantAds': false,
        	'page': 1,
        	'rows': 10,
        	'payTypes': req.body.buyBanks,
        	'countries': [],
        	'publisherType': null,
        	'asset': req.body.buyTicker,
        	'fiat': 'RUB',
        	'tradeType': 'SELL',
			'transAmount': '3000'
    	};
	let sellBody =
	{
        	'proMerchantAds': false,
        	'page': 1,
        	'rows': 1,
        	'payTypes': req.body.sellBanks,
        	'countries': [],
        	'publisherType': null,
        	'asset': req.body.sellTicker,
        	'fiat': 'RUB',
        	'tradeType': 'BUY',
			'transAmount': '5000'
    	};
	let headers = {
            'authority': 'p2p.binance.com',
            'x-trace-id': '16fe9688-c512-49bc-b0bf-317e1f07fb3d',
            'c2ctype': 'c2c_merchant',
            'csrftoken': 'bb1b70ca48b2b4359f1508de21ade2a0',
            'x-ui-request-trace': '16fe9688-c512-49bc-b0bf-317e1f07fb3d',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            'content-type': 'application/json',
            'lang': 'ru',
            'fvideo-id': '3114e6762236ae9685a1b9027da6525086372d6e',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua': '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
            'device-info': 'eyJzY3JlZW5fcmVzb2x1dGlvbiI6IjkwMCwxNjAwIiwiYXZhaWxhYmxlX3NjcmVlbl9yZXNvbHV0aW9uIjoiODczLDE2MDAiLCJzeXN0ZW1fdmVyc2lvbiI6IkxpbnV4IHg4Nl82NCIsImJyYW5kX21vZGVsIjoidW5rbm93biIsInN5c3RlbV9sYW5nIjoicnUtUlUiLCJ0aW1lem9uZSI6IkdNVCs3IiwidGltZXpvbmVPZmZzZXQiOi00MjAsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85NS4wLjQ2MzguNTQgU2FmYXJpLzUzNy4zNiIsImxpc3RfcGx1Z2luIjoiUERGIFZpZXdlcixDaHJvbWUgUERGIFZpZXdlcixDaHJvbWl1bSBQREYgVmlld2VyLE1pY3Jvc29mdCBFZGdlIFBERiBWaWV3ZXIsV2ViS2l0IGJ1aWx0LWluIFBERiIsImNhbnZhc19jb2RlIjoiYjEzMjk4MGUiLCJ3ZWJnbF92ZW5kb3IiOiJHb29nbGUgSW5jLiIsIndlYmdsX3JlbmRlcmVyIjoiR29vZ2xlIFN3aWZ0U2hhZGVyIiwiYXVkaW8iOiIxMjQuMDQzNDc1Mjc1MTYwNzQiLCJwbGF0Zm9ybSI6IkxpbnV4IHg4Nl82NCIsIndlYl90aW1lem9uZSI6IkFzaWEvS3Jhc25veWFyc2siLCJkZXZpY2VfbmFtZSI6IkNocm9tZSBWOTUuMC40NjM4LjU0IChMaW51eCkiLCJmaW5nZXJwcmludCI6IjRhOWE5MWU5YTA1NjUwNDVjZDExMzk0MDg5NzZkYzQ2IiwiZGV2aWNlX2lkIjoiIiwicmVsYXRlZF9kZXZpY2VfaWRzIjoiMTY2MDcyMDA1NDEyMzI4UmozT0lvU2VVSnB3ZmRyMzYifQ==',
            'bnc-uuid': '46c3ad0b-bd5a-45a9-8e7b-2208a0ee81b1',
            'clienttype': 'web',
            'sec-ch-ua-platform': '"Linux"',
            'accept': '*/*',
            'origin': 'https://p2p.binance.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://p2p.binance.com/ru/trade/sell/BTC?fiat=RUB',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'cookie': 'cid=TvWdvH2i; __BINANCE_USER_DEVICE_ID__={"68de4fbb3362d872b3d0472a2c2bb68c":{"date":1620019599246,"value":"1620019598958HQykIRT3VaTXyDJ1maZ"}}; BNC-Location=; sys_mob=no; common_fiat=RUB; showBlockMarket=false; videoViewed=yes; noticeCache={"RUB":true}; p20t=web.90859448.3E3A4935429A430BE7A894F748C3C15B; AWSALBTGCORS=ZsQf42kkmg9cELSj/hmelc9BSe4UDcaRM9HQ5hDKFtV17xkiBBbyhCMA4gvyNRAsAaYohtLVExbq9GwmTrQX/4NJgEcTkpKKZkN1s5dtV9PGbl6hl75NPnhaJHxV0yAV5c1CJwN9pHUHzrrsroxJyLskckCV91Son/2QnLABinna; _gid=GA1.2.1518021979.1660677080; bnc-uuid=46c3ad0b-bd5a-45a9-8e7b-2208a0ee81b1; _gcl_au=1.1.2086618904.1660677119; source=organic; campaign=www.google.com; BNC_FV_KEY=3114e6762236ae9685a1b9027da6525086372d6e; userPreferredCurrency=RUB_USD; se_sd=1RbFlAAsXQbVB4bAKAw5gZZUgVBMaEQUVBddYUkJFFTUQUlNXVQI1; se_gd=FlSVAUVkLHXFwwMgMExMgZZFwUFoLBQUVURdYUkJFFTUQUFNXVEK1; se_gsd=VS8mGgV6LDonNwkvNCU2JA82BBwQAQRVUVtDUVRSVVFVHVNS1; s9r1=211FCF7D86EDA10927880F1CB56A45CA; cr00=5250714E9D049F55DAFB5C8860125A97; d1og=web.90859448.9843AE7D4C23560B51FB9C5B5E8E6F86; r2o1=web.90859448.21D8BE6CC871729F2EA3CB3DC57A6517; f30l=web.90859448.EBBDC907E102D950404D631D30468E0E; logined=y; __BNC_USER_DEVICE_ID__={"68de4fbb3362d872b3d0472a2c2bb68c":{"date":1660720054322,"value":"166072005412328Rj3OIoSeUJpwfdr36"}}; fiat-prefer-currency=USD; lang=ru; futures-layout=pro; OptanonConsent=hosts=&datestamp=Wed+Aug+17+2022+17%3A53%3A38+GMT%2B0700+(%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA%2C+%D1%81%D1%82%D0%B0%D0%BD%D0%B4%D0%B0%D1%80%D1%82%D0%BD%D0%BE%D0%B5+%D0%B2%D1%80%D0%B5%D0%BC%D1%8F)&version=6.34.0&isIABGlobal=false&consentId=fac8e60c-8841-4748-86c8-7503133a6bb9&interactionCount=1&groups=C0001%3A1%2CC0003%3A1%2CC0004%3A1%2CC0002%3A1&isGpcEnabled=0&landingPath=NotLandingPage&AwaitingReconsent=false; _ga=GA1.2.685575726.1659069068; _ga_3WP50LGEEC=GS1.1.1660733621.5.1.1660734034.60.0.0; BNC_FV_KEY_EXPIRE=1660779095116; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2290859448%22%2C%22first_id%22%3A%22182a8125e0b25c-05b21c4d2c604d-17291209-1440000-182a8125e0c71%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22%24device_id%22%3A%22182a8125e0b25c-05b21c4d2c604d-17291209-1440000-182a8125e0c71%22%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTgyYWNkYzY4YjM2YzMtMGI1NDNhMjczMGFiZWU4LTE3MjkxMjA5LTE0NDAwMDAtMTgyYWNkYzY4YjQ3YzkiLCIkaWRlbnRpdHlfbG9naW5faWQiOiI5MDg1OTQ0OCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%2290859448%22%7D%7D; _gat_UA-162512367-1=1'
        };

	Promise.all([
		axios.post(url, buyBody,
    		{
        		headers: headers
		}
		),
		axios.post(url, sellBody,
    		{
        		headers: headers
		}
		)
	]).then(values =>{		
		let idx = 0;
		let prevBuyPrice = values[0]["data"]["data"][idx]["adv"]["price"];
		while(values[0]["data"]["data"][idx]["advertiser"]["userIdentity"] != "" && idx < 9){
			prevBuyPrice = values[0]["data"]["data"][idx]["adv"]["price"]
			++idx;
		}
		let buyPrice = values[0]["data"]["data"][0]["adv"]["price"];
		let sellPrice = values[1]["data"]["data"][0]["adv"]["price"];
		let spread = ((sellPrice - buyPrice)*100)/buyPrice;
		let gmi = ((buyPrice - prevBuyPrice)*100)/prevBuyPrice;// gay merchant index
		spread -= 0.2;
		res.send({
			spread: spread.toFixed(2),
			gmi: gmi.toFixed(2),
			ticker: values[0]["data"]["data"][0]["adv"]["asset"]
		});
	}).catch(err=>console.log(err));
  }

