# Specifikacije za projekat Web shop

## Uvod

Kreirati aplikaciju za Web shop. Aplikaciju koriste kupci za pronalazak i naručivanje artikala i usluga različitih vrsta, kao i trgovine/radnje/pružatelji usluga (u daljem tekstu trgovci) za
kreiranje svoje ponude, te komunikaciju i prodaju robe. Aplikacija treba biti prilagođena
trgovinama razne robe (marketi, odjeća, tehnika, automobili i drugo), ali i drugim tipovima
korisnika (majstori, instrukcije i slično).

Aplikacija se sastoji od više modula, te je predviđena za korištenje različitim tipovima korisnika:

- Glavni administrator, administrator web sistema;
- Administrator prodaje (trgovac), korisnik koji pruža uslugu/prodaje artikal;
- Kupac, korisnik koji traži uslugu/artikal.

Glavni administrator je korisnik koji ima mogućnost uređivanja svih trgovaca i kupaca, njihovo uređivanje statusa (aktivan/neaktivan/blokiran), kao i pristup statističkom modulu za kompletnu platformu.

Administrator prodaje je korisnik koji registruje pružatelja usluga (trgovinu) u aplikaciju. Za svaku trgovinu znamo naziv, kontakt telefon i e-mail, adresu sjedišta i drugih poslovnica (naziv ulice i grad), kategoriju/kategorije usluga i druge podatke.

Administrator unosi svoju ponudu (spisak artikala i usluga koje nudi). Za svaki artikal/uslugu
unosi se naziv, kratak opis, obavezno jedna ili više fotografija, jedna ili više kategorija
usluge/artikla, dostupna količina (nije obavezno polje) i drugi neophodni podaci, poput cijene
jedinične količine. Svaki kupac ima svoj profil, na kojem se može pronaći kompletna ponuda, ali
ima i mogućnost personalizacije i uređivanja profila, poput dodavanja profilne slike, promjene
pozadine (ili cover slike), kao i mogućnost promjene šifre.

Kupac ima mogućnost pretrage proizvoda, dok se na naslovnoj strani prikazuje dio
najprodavanijih artikala, dio slučajno odabranih artikala i dio artikala na osnovu preporuke
sistema (sistem za preporuku osmislite sami). Osim toga, kupac ima mogućnost pretrage
profila, kao i pregleda profila i kreiranja narudžbe, kontaktiranja kupaca putem chata/inboxa.

## Detaljnije specifikacije

- Glavni administrator

  - Mogućnost arhiviranja korisnika (kupaca i trgovaca), te mogućnost blokiranja ili blokiranja na period od 15 dana;
  - Mogućnost slanja poruka svakom korisniku sistema;
  - Statistički modul, sa prikazom broja svih korisnika, broja kupaca, trgovina, artikala, brojem narudžbi sa svim artiklima. Dodati i druge neophodne statistike, te ih prikazati u tabelarnom i grafičkom obliku (grafikon);
  - CRUD za sve lookup tabele (tipovi trgovina, artikala i drugo).

- Trgovac

  - Mogućnost registracije i prijave na sistem;
  - Mogućnost unosa i uređivanja podataka o trgovini;
  - Mogućnost CRUD operacija sa pojedinačnim artiklima;
  - Mogućnost uređivanja kataloga trgovine (spisak usluga/artikala i profila);
  - Notifikacije za svaku narudžbu u kojoj se nalazi artikal trgovca;
  - Mogućnost odobravanja/odbijanja narudžbe nakon što kupac istu kreira;
  - Provjera i evidencija narudžbi. Spisak svih narudžbi sa njihovim statusom;
  - Mogućnost promjene statusa (isporučeno). Provjera ukupne zarade na sistemu.

- Kupac
  - Mogućnost prijave i registracije na sistem;
  - Pri registraciji, obavezno se unosi ime, prezime i e-mail korisnika;
  - Unosi se niz interesa (usluga/proizvoda/tipova proizvoda) za navedenog
    korisnika;
  - Naslovna strana sa tri grupe artikala/usluga (najpopularnije, slučajno odabrano i
    preporučeno za kupca na osnovu njegovih interesa);
  - Mogućnost pretrage artikala, trgovina, tipova artikala i drugo;
  - Pregled pojedinačnog artikla ili profila trgovine;
  - Mogućnost kreiranja narudžbi (tj. dodavanje artikala u korpu i potvrda narudžbe);
  - Potvrdom narudžbe, ostavlja se studentima na izbor jedna od dvije opcije: jedna
    narudžba može sadržavati artikle od samo jednog trgovca ili jedna narudžba
    može sadržavati artikle više trgovina. U prvom slučaju, ako se u košari nalazi
    više trgovaca, za svakog se kreira odvojena narudžba;
  - Nakon kreirane narudžbe, šalje se e-mail kupcu da je narudžba uspješno
    poslana, te kupac dobija e-mail i pri promjeni statusa narudžbe;
  - Kupac ima mogućnost provjere liste svih svojih narudžbi sa njihovim statusima,
    ima mogućnost otkazivanja narudžbe (ukoliko ista nije isporučena), ali nema
    mogućnost uređivanja sadržaja.

## Dodatni zahtjevi

- Chat između kupca-trgovca, trgovca-administratora i kupca-administratora;
- Ocjenjivanje usluge trgovca. Kupac može ostaviti komentar ili ocjenu za trgovca, te
  ocjenu za svaki artikal. Popularnost artikla zavisi od prosječne ocjene, kao i od ukupnog
  broja narudžbi tog artikla;
- Sortiranje i filtriranje artikala/usluga na profilu trgovca, kao i na naslovnoj strani;
- Tri originalne dodatne specifikacije koje treba da osmisli student.
