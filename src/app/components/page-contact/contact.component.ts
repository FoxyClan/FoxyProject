import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})


export class ContactComponent {
  contactForm: FormGroup;
  selectedSubject: string = '';

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      address: ['', Validators.required],
      description: ['', Validators.required],
      subject: ['', Validators.required],
      section: ['', Validators.required]
    });
  }

  onSubjectChange(event: any) {
    this.selectedSubject = event.target.value;

    if (this.selectedSubject !== 'bug') {
      this.contactForm.get('section')?.setValue(''); // Réinitialise si ce n'est pas un bug
    }
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      this.contactService.sendMessage(this.contactForm.value).subscribe(response => {
        alert('Message envoyé avec succès !');
        this.contactForm.reset();
        this.selectedSubject = ''; // Réinitialiser le subject après soumission
      }, error => {
        alert('Erreur lors de l’envoi du message.');
      });
    }
  }
}
