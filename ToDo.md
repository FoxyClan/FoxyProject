ALL
- mettre tout en em ou rem
- ne pas mettre 20000 mais totalSupply - burnedTokens

HEADER
- [hidden] donnes un probleme http / injector de trait.service

WEB3SERVICE
- enlever le commentaire de switchethaccount
- merge : on recupere le tableau tokenIdsAfter et on le compare a tokenIdsBefore, ce devrait etre trois token retourné 2 burn et le nouveau
- enelever commentaire sur la limite de mint par wallet
- clee infura visible de tous ?

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
- empecher le scroll

COLLECTION:
- no result quand ça charge encore
- probleme click sur neon nose sur MODAL-COLLECTION quand on est sur la collection
- mettre undiscoverd en ipfs ou sur filebase ?

JAR
- traits png -> jpeg ?
- JAVA securisé avec toutes les fonctions en public ?
- superposition des traits non compatibles dans la creation
- enlever commentaire test si tokenId existe sur file base pour mint / merge



ACTUAL :
- faire tous les transfers events
- mettre plus de details dans les transfer dans modal account
