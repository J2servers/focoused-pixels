import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusColor, getStatusIcon, TrackingResult } from './trackingHelpers';

interface Props {
  result: TrackingResult;
  whatsappLink?: string;
}

export function TrackingResultCard({ result, whatsappLink }: Props) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {result.isDelivered ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : result.error ? (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <Truck className="h-6 w-6 text-primary" />
                )}
                {result.code}
              </CardTitle>
              <CardDescription className="mt-1">{result.error || result.lastStatus}</CardDescription>
            </div>
            <Badge className={getStatusColor(result.lastStatus)}>
              {result.isDelivered ? 'Entregue' : 'Em trânsito'}
            </Badge>
          </div>
        </CardHeader>
        {result.events && result.events.length > 0 && (
          <CardContent>
            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
              <div className="space-y-6">
                {result.events.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex gap-4"
                  >
                    <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      {getStatusIcon(event.status, index === 0)}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold">{event.status}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Último</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                        {event.time && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      <Card className="mt-6 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Tem dúvidas sobre seu pedido? Entre em contato conosco!
            </p>
            {whatsappLink && (
              <Button variant="outline" asChild>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
