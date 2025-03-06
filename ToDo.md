ALL
- mettre tout en em ou rem
- ne pas mettre 20000 mais totalSupply - burnedTokens

HEADER
- [hidden] donnes un probleme http / injector de trait.service

WEB3SERVICE
- enlever le commentaire de switchethaccount
- merge : on recupere le tableau tokenIdsAfter et on le compare a tokenIdsBefore, ce devrait etre trois token retourné 2 burn et le nouveau
- enelever commentaire sur la limite de mint par wallet

MODAL-WALLET
- mettre le wallet recent en haut

MODAL-ACCOUNT
- ne rien afficher si le reseau n'est pas eth
- transfers

SMART CONTRACT
- mettre a jour les commentaires
- a tester nombre d'addresse passable dans airdrop (test net) (100)
- award fonctions usePoints
- verifier que les token burn sont bien calculé dans les prochains mint pour la totale supply
- foxyAward.sol


GANACHE
- supprimer commentaire web3service getBalance / modal account loadBalance -> catch consol error

MODAL MINT
- niveau et points du token ?


JAR
- traits png -> jpeg ?
- JAVA securisé avec toutes les fonctions en public ?
- CORS probleme clear-tmp after merge



ACTUAL :
- rareté avec mutation
- discover nft
- different mutation
- changer nom mutation
- trait mutation dans collection
- quand je clique sur my collection apres avoir ete deco ça ne retest pas le owner
- merge / mint colision des traits
- mutation lors du deuxieme merge marche bien ou c'est juste rerajouté ? amelioration de la mutation lors d'un secon merge ?
