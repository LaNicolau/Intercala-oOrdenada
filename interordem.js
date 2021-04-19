const fs = require('fs/promises')

async function Carregar(diretorio){
    const fd = await fs.open(diretorio, 'r')
    const status = await fs.stat(diretorio)
    let buffer = Buffer.alloc(72)
    let total = Math.floor(status.size/300)
    let posicao = 0
    let v = []


    for(let i=0; i<total; i++){
        let end = {}
      
        await fd.read(buffer, 0, 72, posicao)
        end.logradouro = buffer.toString('utf8', 0, 72)
        posicao += 72 

        await fd.read(buffer, 0, 72, posicao)
        end.bairro = buffer.toString('utf8', 0, 72)
        posicao += 72  

        await fd.read(buffer, 0, 72, posicao)
        end.cidade = buffer.toString('utf8', 0, 72)
        posicao += 72  

        await fd.read(buffer, 0, 72, posicao)
        end.uf = buffer.toString('utf8', 0, 72)
        posicao += 72  

        await fd.read(buffer, 0, 2, posicao)
        end.sigla = buffer.toString('utf8', 0, 2)
        posicao += 2  

        await fd.read(buffer, 0, 8, posicao)
        end.cep = buffer.toString('utf8', 0, 8)
        posicao += 8  

        await fd.read(buffer, 0, 2, posicao)
        end.lixo = buffer.toString('utf8', 0, 2)
        posicao += 2  

        v[i] = end
    }

    await fd.close()
    return v
}

let l=1

function MergeSort(vetor, control){
    if(control===4){
        const x = MergeSort(vetor, 5)
        escrita(x, l++)
        return []
    }

    const meio = vetor.length/2
    if(vetor.length < 2){
        return vetor
    }
    const metesq = vetor.splice(0, meio)
    return Merge(MergeSort(metesq, control+1), MergeSort(vetor, control+1))
}

function Merge(esq, dir){
    let org = []
    while(esq.length && dir.length !== 0){
        if(esq[0].cep < dir[0].cep){
            org.push(esq.shift())   
        }else{
            org.push(dir.shift())
        }
    }
    return [...org, ...esq, ...dir]
}

async function escrita(vetor, aux){
    let infend = ''

    for(let i=0; i<vetor.length; i++){
        infend += vetor[i].logradouro +
                    vetor[i].bairro +
                    vetor[i].cidade + 
                    vetor[i].uf + 
                    vetor[i].sigla +
                    vetor[i].cep +
                    vetor[i].lixo
    }
    await fs.writeFile(`./cep${aux}.dat`, infend, "binary")
}

async function juntarpart(total, j){
    for(let i=0; i<total/2; i++){
        let end1 = await Carregar(`./cep${j}.dat`)
        let end2 = await Carregar(`./cep${j+1}.dat`)

        let junt = Merge(end1, end2)
        await escrita(junt, total+j-i)
        j+=2
    }
    if(total > 2){
        juntarpart(total/2, j)
    }
}

async function main(){
    const endereco = await Carregar('./cep.dat')
    await MergeSort(endereco, 0)
    juntarpart(16, 1)
}

main()