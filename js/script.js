class Autocomplete extends HTMLElement {

    constructor(){

        super();

        // declaration

        const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
        const token = "b9dd88dc516c9d97b1629daca9d7bb97b7321d80";

        const search = document.getElementById('search');
        const nameList = document.getElementById('name_list');
        const shortName = document.getElementById('name_short');
        const fullName = document.getElementById('name_full');
        const innKpp = document.getElementById('inn_kpp');
        const address = document.getElementById('address');
        const type = document.getElementById('type');

        search.addEventListener('input', () => searchCompanies(search.value));
        window.addEventListener('click', (e) => {
            if (e.target !== 'name_list' || e.target !== 'autocomplete')
            nameList.style.display = 'none';
        });

        // Search Companies 

        const searchCompanies =  searchText => {

            const query = search.value;

            const options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify({query: query})
            }

            fetch(url, options)
            .then(data => {
                        if(!data) return; 
                        data.json().then(json => {
                            let companiesNames = [];
                            let companies = json.suggestions
                            companies.forEach(item => companiesNames.push(item.value))
                            if (searchText === 0) {
                                companiesNames = []
                                nameList.innerHTML = '';
                            }
                            outputHtml(companiesNames, companies);
                        });
            })
            .catch(error => console.log("error", error));    
            
            //help funcs

            const typeDescription = (type) => {
                var TYPES = {
                'INDIVIDUAL': 'Индивидуальный предприниматель',
                'LEGAL': 'Организация'
                }
                return TYPES[type];
            }

            // Show results in HTML 

            const outputHtml = (companiesNames, companies) => {

                nameList.style.display = 'block';

                if(companiesNames.length < 0) return; 

                const companiesList = companies.map(prop => `
                    <div class ="companiesNameList">
                        <div class='companiesNameList_item'>
                            <div class='companiesNameList_item_name'>${prop.value}</div>
                            <div class='companiesNameList_item_inn'>${prop.data.inn}</div>
                            <div class='companiesNameList_item_address'>${prop.data.address.value}</div>
                        </div>
                    </div>
                `).join('');

                nameList.innerHTML = companiesList;    

                nameList.onclick = (e) => {
                    const target = e.target; 
                    if(target.className === 'name_list') return;   
                    search.value = e.target.parentNode.childNodes[1].innerHTML;
                    search.focus();

                    companies.map((prop) => {
                        if(prop.value !== e.target.parentNode.childNodes[1].innerHTML) return;
    
                        type.innerText = `${typeDescription(prop.data.type)} (${prop.data.type})`;
                        shortName.value = prop.data.name.short ? prop.data.name.short : prop.value;
                        fullName.value = prop.data.name.full_with_opf;
                        innKpp.value = `${prop.data.inn} / ${prop.data.kpp ? prop.data.kpp : '-'}`;
                        address.value = prop.data.address.value;
                    })
                }
            }
        }

    }
}

customElements.define('auto-complete', Autocomplete);
