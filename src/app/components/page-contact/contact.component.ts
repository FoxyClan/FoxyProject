  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { ContactService } from '../../services/contact.service';
  import { ReactiveFormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { Web3Service } from '../../services/web3.service';
  import Web3 from 'web3';

  @Component({
    selector: 'app-contact',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css'
  })


  export class ContactComponent implements OnInit{
    contactForm: FormGroup;
    selectedSubject: string = '';

    isConnected: boolean = false;
    walletAddress: string = 'Anonymous';

    constructor(private fb: FormBuilder, 
      private contactService: ContactService, 
      private web3Service: Web3Service) {
      this.contactForm = this.fb.group({
        address: [{ value: 'Anonymous', disabled: true }],
        email: ['', [Validators.required, Validators.email]],
        description: ['', Validators.required],
        subject: ['', Validators.required],
        section: ['']
      });
    }

    ngOnInit() {
      this.web3Service.isConnected$.subscribe((isConnected) => {
        this.isConnected = isConnected;
        if(!isConnected) this.contactForm.get('address')?.setValue('Anonymous');
      });
      this.web3Service.walletAddress$.subscribe((walletAddress) => {
        if (!walletAddress) return;
        const checksumAddress = Web3.utils.toChecksumAddress(walletAddress);
        this.walletAddress = checksumAddress;
        this.contactForm.get('address')?.setValue(this.walletAddress);
      });
    }

    onSubjectChange(event: any) {
      this.selectedSubject = event.target.value;
      const sectionControl = this.contactForm.get('section');

      if (this.selectedSubject === 'bug') {
        sectionControl?.setValidators(Validators.required); // Rendre obligatoire
      } else {
        sectionControl?.clearValidators(); // Retirer la validation
        sectionControl?.setValue(''); // Réinitialiser la valeur
      }

      sectionControl?.updateValueAndValidity(); // Appliquer les changements
    }


    onSubmit() {
      if (!this.contactForm.valid) return;
    
      const formData = {
        address: this.contactForm.get('address')?.value || 'Anonymous',
        email: this.contactForm.get('email')?.value || '',
        description: this.contactForm.get('description')?.value || '',
        subject: this.contactForm.get('subject')?.value || '',
        section: this.selectedSubject === 'bug' ? this.contactForm.get('section')?.value : null
      };
    
      console.log("Envoi du formulaire...", formData);
    
      this.contactService.sendMessage(formData).subscribe({
        next: response => {
          console.log("✅ Réponse du serveur:", response);
    
          if (response.status === 200 && response.body?.message) {
            alert(response.body.message);
          } else {
            alert("Erreur lors de l’envoi du message.");
          }
    
          this.contactForm.reset();
          this.selectedSubject = ''; // Réinitialiser après soumission
          this.contactForm.get('address')?.setValue(this.walletAddress); // Remet l'adresse du wallet après reset
        },
        error: error => {
          console.error("❌ Erreur lors de l'envoi:", error);
          alert("Erreur lors de l’envoi du message.");
        }
      });
    }
    
     
}
