ALL
- ne pas mettre 20000 mais totalSupply - burnedTokens
- mettre des animation d'arrivé sur toutes les pages comme home ou collection

RESPONSIVE
- probleme background home flou

HOME
- modifier les chiffres de la premiere page

WEB3SERVICE
- enlever le commentaire de switchethaccount
- merge : on recupere le tableau tokenIdsAfter et on le compare a tokenIdsBefore, ce devrait etre trois token retourné 2 burn et le nouveau
- enelever commentaire sur la limite de mint par wallet
- clée infura visible de tous ?
- Ledger integration : https://developers.ledger.com/docs/device-interaction/ledgerjs/beginner/transfer-eth
- wallet connect integration : yt playlist NFT
- infura mainnet
- si erreur java pas de loadnft = false pour merge et discover mais oui pour mint


MODAL-ACCOUNT
- ne rien afficher si le reseau n'est pas eth
- events "transfers" details & test d'envoie de nft & et test que les points descendent bien etc ...
- event usePoints, et rajouter des fonction dans les transaction (jsp si y a tout la)
- probleme change de chain gnosis xdai est noté en eth


SMART CONTRACT
- mettre a jour les commentaires
- a tester nombre d'addresse passable dans airdrop (test net) (100)
- award fonctions usePoints
- verifier que les token burn sont bien calculé dans les prochains mint pour la totale supply
- supprimer la suppression des points quand transfer ?
- gain de point uniquement quand level 2 ?


GANACHE
- supprimer commentaire web3service getBalance / modal account loadBalance -> catch console error


COLLECTION:
- probleme click sur neon nose sur MODAL-COLLECTION quand on est sur la collection
- mettre undiscoverd en ipfs ou sur filebase ?

JAR
- JAVA securisé avec toutes les fonctions en public ?
- superposition des traits non compatibles dans la creation
- enlever commentaire test si tokenId existe sur file base pour mint / merge
- demander a valentin si address gmail risque pour le contact
- changer le .gitignore pour le application.yml et changer les private key

TEAM
- finir les membres
- changer les images

MODAL-MINT
- tester engraved samourai mask taille dans attributs