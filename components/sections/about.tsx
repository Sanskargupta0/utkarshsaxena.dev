import ProofOfWorkCallout from "../proof-of-work-callout";
import TechBadge from "../ui/tech-badge";
import userData from "@/config/userData";
import {getCompany} from "@/config/companies";
import {Button} from "../ui/button";

export default function About(){
 return <div><div className="p-4 w-full mx-auto space-y-4 pb-8"><div className="enter-list text-muted-foreground text-base tracking-tight">
  <div>I&apos;m a <h1 className="inline-block border-foreground/60 text-foreground">Product Manager &amp; Software Engineer</h1> at <TechBadge tag="Piovation GMBH" href={getCompany('Piovation')!.href}/>, where I lead PioWorkers, a digital workers and cloud operations platform. I build Golang microservices and reliable cloud infrastructure.</div>
  <div className="mt-6 leading-relaxed">{userData.about}</div>
  <div className="mt-6"><div className="text-muted-foreground leading-relaxed">Previously, I worked at <TechBadge tag="RabbitLoader" href={getCompany('RabbitLoader')!.href}/> and <TechBadge tag="Wizwack" href={getCompany('Wizwack')!.href}/>, building high-traffic services, distributed systems and multiplayer backends.</div></div>
  <ProofOfWorkCallout />
  <div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="outline"><a href="/Utkarsh-Saxena-Resume.pdf" download="Utkarsh-Saxena-Resume.pdf">Download resume</a></Button><Button asChild variant="outline"><a href="/Utkarsh-Saxena-Resume.pdf" target="_blank" rel="noopener noreferrer">View resume</a></Button><Button asChild variant="outline"><a href="mailto:utkarshsaxena2012@gmail.com">Get in touch</a></Button></div>
 </div></div></div>;
}
